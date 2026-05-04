'use strict';
const { body } = require('express-validator');

const createReservationValidator = [
  body('slot_id').isUUID().withMessage('Créneau invalide.'),
  body('service_id').isUUID().withMessage('Prestation invalide.'),
  body('notes').optional().isString().isLength({ max: 500 }),
];

module.exports = { createReservationValidator };
