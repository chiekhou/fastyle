'use strict';

const success = (res, data = {}, message = 'Succès', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const created = (res, data = {}, message = 'Créé avec succès') => {
  return success(res, data, message, 201);
};

const paginated = (res, rows, count, page, limit) => {
  return res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  });
};

module.exports = { success, created, paginated };
