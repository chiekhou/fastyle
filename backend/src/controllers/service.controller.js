'use strict';
const { Service } = require('../models');
const { success, created } = require('../utils/response.utils');
const { AppError } = require('../middlewares/error.middleware');

// GET /api/services
const getServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    return success(res, services);
  } catch (err) {
    next(err);
  }
};

// GET /api/services/:id
const getService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service || !service.is_active) throw new AppError('Prestation introuvable.', 404);
    return success(res, service);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/services
const createService = async (req, res, next) => {
  try {
    const { name, description, duration_minutes, price } = req.body;
    const service = await Service.create({
      name, description, duration_minutes, price,
      image_url: req.file?.path || null,
    });
    return created(res, service, 'Prestation créée.');
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/services/:id
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) throw new AppError('Prestation introuvable.', 404);

    await service.update({
      ...req.body,
      ...(req.file && { image_url: req.file.path }),
    });
    return success(res, service, 'Prestation mise à jour.');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/services/:id (soft delete)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) throw new AppError('Prestation introuvable.', 404);
    await service.update({ is_active: false });
    return success(res, {}, 'Prestation désactivée.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getServices, getService, createService, updateService, deleteService };
