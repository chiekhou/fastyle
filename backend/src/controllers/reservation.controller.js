'use strict';
const { Op } = require('sequelize');
const { Reservation, Slot, Service, User, sequelize } = require('../models');
const { createPaypalOrder, capturePaypalOrder, refundPaypalCapture } = require('../config/paypal');
const { sendReservationConfirmation, sendReservationCancellation } = require('../utils/email.utils');
const { success, created, paginated } = require('../utils/response.utils');
const { AppError } = require('../middlewares/error.middleware');

// POST /api/reservations
// Étape 1 : créer la réservation + générer l'ordre PayPal pour l'acompte
const createReservation = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { slot_id, service_id, notes } = req.body;
    const userId = req.user.id;

    // Vérifier la prestation
    const service = await Service.findByPk(service_id);
    if (!service || !service.is_active) throw new AppError('Prestation introuvable.', 404);

    // Vérifier le créneau
    const slot = await Slot.findByPk(slot_id, { transaction: t, lock: true });
    if (!slot || slot.is_blocked) throw new AppError('Créneau indisponible.', 409);

    // Vérifier qu'il n'est pas déjà pris
    const slotTaken = await Reservation.findOne({
      where: { slot_id, status: { [Op.in]: ['pending', 'confirmed'] } },
      transaction: t,
    });
    if (slotTaken) throw new AppError('Ce créneau est déjà réservé.', 409);

    // Vérifier qu'elle n'a pas déjà une réservation ce jour-là
    const userHasReservation = await Reservation.findOne({
      where: {
        user_id: userId,
        reservation_date: slot.date,
        status: { [Op.in]: ['pending', 'confirmed'] },
      },
      transaction: t,
    });
    if (userHasReservation) {
      throw new AppError('Vous avez déjà une réservation ce jour-là.', 409);
    }

    const totalPrice = parseFloat(service.price);
    const depositAmount = parseFloat((totalPrice * 0.5).toFixed(2));

    // Créer la réservation en statut pending
    const reservation = await Reservation.create(
      {
        user_id: userId,
        slot_id,
        service_id,
        total_price: totalPrice,
        deposit_amount: depositAmount,
        deposit_status: 'pending',
        status: 'pending',
        reservation_date: slot.date,
        notes,
      },
      { transaction: t }
    );

    // Créer l'ordre PayPal pour l'acompte
    const paypalOrder = await createPaypalOrder(
      depositAmount,
      `Acompte réservation ${service.name}`,
      reservation.id
    );

    // Stocker l'ID PayPal
    await reservation.update(
      { deposit_paypal_order_id: paypalOrder.id },
      { transaction: t }
    );

    await t.commit();

    // Retourner l'ordre PayPal pour que le front redirige vers PayPal
    return created(res, {
      reservation,
      paypal_order_id: paypalOrder.id,
      approve_url: paypalOrder.links.find((l) => l.rel === 'approve')?.href,
    }, 'Réservation initiée. Veuillez régler l\'acompte.');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// POST /api/reservations/:id/capture-deposit
// Étape 2 : capturer le paiement PayPal après retour du client
const captureDeposit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paypal_order_id } = req.body;

    const reservation = await Reservation.findOne({
      where: { id, user_id: req.user.id },
      include: [
        { model: Slot, as: 'slot' },
        { model: Service, as: 'service' },
      ],
    });

    if (!reservation) throw new AppError('Réservation introuvable.', 404);
    if (reservation.deposit_status === 'paid') {
      throw new AppError('L\'acompte a déjà été réglé.', 409);
    }
    if (reservation.deposit_paypal_order_id !== paypal_order_id) {
      throw new AppError('Ordre PayPal invalide.', 400);
    }

    // Capturer le paiement
    const { captureId } = await capturePaypalOrder(paypal_order_id);

    await reservation.update({
      deposit_status: 'paid',
      deposit_paypal_capture_id: captureId,
      status: 'confirmed',
    });

    // Email de confirmation
    const user = await User.findByPk(req.user.id);
    sendReservationConfirmation(user, reservation, reservation.service).catch(console.error);

    return success(res, reservation, 'Acompte réglé. Réservation confirmée !');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reservations/:id
// Annulation avec remboursement si applicable
const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const isAdmin = req.user.role === 'admin';

    const reservation = await Reservation.findByPk(id);
    if (!reservation) throw new AppError('Réservation introuvable.', 404);

    // Une cliente ne peut annuler que sa propre réservation
    if (!isAdmin && reservation.user_id !== req.user.id) {
      throw new AppError('Accès refusé.', 403);
    }

    if (['cancelled', 'completed'].includes(reservation.status)) {
      throw new AppError('Cette réservation ne peut pas être annulée.', 409);
    }

    let refunded = false;

    // Rembourser l'acompte si déjà payé
    if (reservation.deposit_status === 'paid' && reservation.deposit_paypal_capture_id) {
      await refundPaypalCapture(
        reservation.deposit_paypal_capture_id,
        reservation.deposit_amount,
        'Annulation de réservation'
      );
      refunded = true;
      await reservation.update({ deposit_status: 'refunded' });
    }

    await reservation.update({
      status: 'cancelled',
      cancellation_reason: reason,
    });

    const user = await User.findByPk(reservation.user_id);
    sendReservationCancellation(user, reservation, refunded).catch(console.error);

    return success(res, { reservation, refunded }, 'Réservation annulée.');
  } catch (err) {
    next(err);
  }
};

// GET /api/reservations/my
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Slot, as: 'slot', attributes: ['date', 'period'] },
        { model: Service, as: 'service', attributes: ['id', 'name', 'image_url'] },
      ],
      order: [['reservation_date', 'DESC']],
    });
    return success(res, reservations);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/reservations
const getAllReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, date } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    if (date) where.reservation_date = date;

    const { count, rows } = await Reservation.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: Slot, as: 'slot', attributes: ['date', 'period'] },
        { model: Service, as: 'service', attributes: ['id', 'name'] },
      ],
      order: [['reservation_date', 'DESC']],
      limit,
      offset,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/reservations/:id/complete
const completeReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) throw new AppError('Réservation introuvable.', 404);
    if (reservation.status !== 'confirmed') {
      throw new AppError('Seules les réservations confirmées peuvent être complétées.', 409);
    }
    await reservation.update({ status: 'completed' });
    return success(res, reservation, 'Réservation marquée comme terminée.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReservation,
  captureDeposit,
  cancelReservation,
  getMyReservations,
  getAllReservations,
  completeReservation,
};
