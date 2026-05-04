'use strict';
const express = require('express');
const router = express.Router();
const { getServices, getService, createService, updateService, deleteService } = require('../controllers/service.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const { uploadServiceImage } = require('../middlewares/upload.middleware');

// Publiques
router.get('/', getServices);
router.get('/:id', getService);

// Admin seulement
router.post('/', authenticate, isAdmin, uploadServiceImage, createService);
router.put('/:id', authenticate, isAdmin, uploadServiceImage, updateService);
router.delete('/:id', authenticate, isAdmin, deleteService);

module.exports = router;
