'use strict';
const { Op } = require('sequelize');
const { Slot, Reservation, Service } = require('../models');
const { success } = require('../utils/response.utils');
const { AppError } = require('../middlewares/error.middleware');

// GET /api/slots?month=2024-06
// Retourne tous les créneaux d'un mois avec leur disponibilité
const getSlots = async (req, res, next) => {
  try {
    const { month } = req.query; // format: YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new AppError('Paramètre month requis (format: YYYY-MM).', 400);
    }

    const [year, m] = month.split('-');
    const startDate = `${year}-${m}-01`;
    const endDate = new Date(year, m, 0).toISOString().split('T')[0]; // dernier jour du mois

    const slots = await Slot.findAll({
      where: { date: { [Op.between]: [startDate, endDate] } },
      include: [
        { model: Service, as: 'service', attributes: ['id', 'name'] },
        {
          model: Reservation,
          as: 'reservation',
          attributes: ['id', 'status'],
          where: { status: ['pending', 'confirmed'] },
          required: false,
        },
      ],
      order: [['date', 'ASC'], ['period', 'ASC']],
    });

    // Calculer la disponibilité de chaque créneau
    const result = slots.map((slot) => ({
      id: slot.id,
      date: slot.date,
      period: slot.period,
      is_blocked: slot.is_blocked,
      block_reason: slot.block_reason,
      service: slot.service,
      is_available: !slot.is_blocked && !slot.reservation,
    }));

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

// GET /api/slots/available?date=2024-06-15
// Créneaux disponibles pour une date donnée
const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) throw new AppError('Paramètre date requis.', 400);

    const slots = await Slot.findAll({
      where: { date, is_blocked: false },
      include: [
        {
          model: Reservation,
          as: 'reservation',
          attributes: ['id'],
          where: { status: ['pending', 'confirmed'] },
          required: false,
        },
      ],
    });

    const available = slots.filter((s) => !s.reservation);
    return success(res, available);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/slots/:id/block
const blockSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_blocked, block_reason } = req.body;

    const slot = await Slot.findByPk(id);
    if (!slot) throw new AppError('Créneau introuvable.', 404);

    // Vérifier qu'il n'y a pas de réservation confirmée
    const reservation = await Reservation.findOne({
      where: { slot_id: id, status: ['pending', 'confirmed'] },
    });
    if (reservation && is_blocked) {
      throw new AppError('Impossible de bloquer un créneau déjà réservé.', 409);
    }

    await slot.update({ is_blocked, block_reason: is_blocked ? block_reason : null });
    return success(res, slot, 'Créneau mis à jour.');
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/slots/generate
// Génère les créneaux pour une période donnée
const generateSlots = async (req, res, next) => {
  try {
    const { start_date, end_date, closed_days = [0] } = req.body;
    // closed_days: tableau de jours fermés (0=dimanche, 6=samedi...)

    const periods = ['morning', 'afternoon', 'evening'];
    const slots = [];
    const current = new Date(start_date);
    const end = new Date(end_date);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];

      if (!closed_days.includes(dayOfWeek)) {
        for (const period of periods) {
          // Vérifier que le créneau n'existe pas déjà
          const exists = await Slot.findOne({ where: { date: dateStr, period } });
          if (!exists) {
            slots.push({ date: dateStr, period });
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }

    const created = await Slot.bulkCreate(slots);
    return success(res, { created: created.length }, `${created.length} créneaux générés.`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSlots, getAvailableSlots, blockSlot, generateSlots };
