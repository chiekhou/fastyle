'use strict';
const { Order, OrderItem, Product, ProductVariant, User, sequelize } = require('../models');
const { createPaypalOrder, capturePaypalOrder } = require('../config/paypal');
const { sendOrderConfirmation } = require('../utils/email.utils');
const { success, created, paginated } = require('../utils/response.utils');
const { AppError } = require('../middlewares/error.middleware');
const { calculateShipping } = require('../utils/shipping.utils');

// POST /api/orders
// items: [{ product_id, variant_id?, quantity }]
const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, shipping_address, notes, shipping_carrier } = req.body;
    if (!items || items.length === 0) throw new AppError('Panier vide.', 400);
    if (!['mondial_relay', 'colissimo'].includes(shipping_carrier)) {
      throw new AppError('Transporteur invalide. Choisissez Mondial Relay ou Colissimo.', 400);
    }

    let totalPrice = 0;
    let totalWeightGrams = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction: t, lock: true });
      if (!product || !product.is_active) {
        throw new AppError(`Produit introuvable : ${item.product_id}`, 404);
      }

      let unitPrice = product.price;
      let variantLabel = null;

      if (item.variant_id) {
        const variant = await ProductVariant.findOne({
          where: { id: item.variant_id, product_id: product.id, is_active: true },
          transaction: t,
          lock: true,
        });
        if (!variant) throw new AppError(`Variante introuvable.`, 404);
        if (variant.stock_qty < item.quantity) {
          throw new AppError(`Stock insuffisant pour "${product.name} — ${variant.label}".`, 409);
        }
        unitPrice = variant.price_override || product.price;
        variantLabel = variant.label;

        // Décrémenter le stock variante
        await variant.update(
          { stock_qty: variant.stock_qty - item.quantity },
          { transaction: t }
        );
      } else {
        if (product.stock_qty < item.quantity) {
          throw new AppError(`Stock insuffisant pour "${product.name}".`, 409);
        }
        // Décrémenter le stock produit
        await product.update(
          { stock_qty: product.stock_qty - item.quantity },
          { transaction: t }
        );
      }

      totalPrice += unitPrice * item.quantity;
      totalWeightGrams += (product.weight_grams || 250) * item.quantity;
      orderItemsData.push({
        product_id: product.id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: unitPrice,
        product_name_snapshot: product.name,
        variant_label_snapshot: variantLabel,
      });
    }

    // Calculer la livraison
    const shippingCost = calculateShipping(shipping_carrier, totalWeightGrams, totalPrice);
    const grandTotal   = parseFloat((totalPrice + shippingCost).toFixed(2));

    // Créer la commande
    const order = await Order.create(
      {
        user_id: req.user.id,
        status: 'pending',
        total_price: grandTotal,
        shipping_address,
        shipping_carrier,
        shipping_cost: shippingCost,
        notes,
      },
      { transaction: t }
    );

    // Créer les lignes
    const createdItems = await OrderItem.bulkCreate(
      orderItemsData.map((i) => ({ ...i, order_id: order.id })),
      { transaction: t }
    );

    // Créer l'ordre PayPal (sous-total + livraison affichés séparément)
    const paypalOrder = await createPaypalOrder(
      parseFloat(totalPrice.toFixed(2)),
      `Commande FaStyle #${order.id.slice(0, 8)}`,
      order.id,
      shippingCost
    );

    await order.update({ paypal_order_id: paypalOrder.id }, { transaction: t });
    await t.commit();

    return created(res, {
      order: { ...order.toJSON(), items: createdItems },
      paypal_order_id: paypalOrder.id,
      approve_url: paypalOrder.links.find((l) => l.rel === 'approve')?.href,
    }, 'Commande créée. Veuillez finaliser le paiement.');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// POST /api/orders/:id/capture
const captureOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paypal_order_id } = req.body;

    const order = await Order.findOne({
      where: { id, user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) throw new AppError('Commande introuvable.', 404);
    if (order.status !== 'pending') throw new AppError('Commande déjà traitée.', 409);
    if (order.paypal_order_id !== paypal_order_id) throw new AppError('Ordre PayPal invalide.', 400);

    const { captureId } = await capturePaypalOrder(paypal_order_id);

    await order.update({ status: 'paid', paypal_capture_id: captureId });

    const user = await User.findByPk(req.user.id);
    sendOrderConfirmation(user, order).catch(console.error);

    return success(res, order, 'Paiement confirmé. Commande en cours de traitement.');
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/my
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']],
    });
    return success(res, orders);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: OrderItem, as: 'items' },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) throw new AppError('Statut invalide.', 400);

    const order = await Order.findByPk(req.params.id);
    if (!order) throw new AppError('Commande introuvable.', 404);

    await order.update({ status });
    return success(res, order, 'Statut mis à jour.');
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, captureOrder, getMyOrders, getAllOrders, updateOrderStatus };
