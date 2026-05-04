import api from './client';

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register:    (data) => api.post('/auth/register', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  login:       (data) => api.post('/auth/login', data),
  refresh:     (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout:      (refreshToken) => api.post('/auth/logout', { refreshToken }),
  logoutAll:   () => api.post('/auth/logout-all'),
  me:          () => api.get('/auth/me'),
};

// ── Users ────────────────────────────────────────────────────
export const userApi = {
  getProfile:      () => api.get('/users/profile'),
  updateProfile:   (data) => api.put('/users/profile', data),
  changePassword:  (data) => api.put('/users/change-password', data),
  // Admin
  getAll:          (params) => api.get('/users', { params }),
  toggleActive:    (id) => api.patch(`/users/${id}/toggle-active`),
  deleteUser:      (id) => api.delete(`/users/${id}`),
};

// ── Services (prestations) ────────────────────────────────────
export const serviceApi = {
  getAll:    () => api.get('/services'),
  getOne:    (id) => api.get(`/services/${id}`),
  // Admin
  create:    (data) => api.post('/services', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:    (id, data) => api.put(`/services/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:    (id) => api.delete(`/services/${id}`),
};

// ── Slots (créneaux) ──────────────────────────────────────────
export const slotApi = {
  getByMonth:    (month) => api.get('/slots', { params: { month } }),
  getAvailable:  (date) => api.get('/slots/available', { params: { date } }),
  // Admin
  block:         (id, data) => api.patch(`/slots/${id}/block`, data),
  generate:      (data) => api.post('/slots/generate', data),
};

// ── Reservations ──────────────────────────────────────────────
export const reservationApi = {
  create:          (data) => api.post('/reservations', data),
  captureDeposit:  (id, paypalOrderId) =>
    api.post(`/reservations/${id}/capture-deposit`, { paypal_order_id: paypalOrderId }),
  getMine:         () => api.get('/reservations/my'),
  cancel:          (id, reason) => api.delete(`/reservations/${id}`, { data: { reason } }),
  // Admin
  getAll:          (params) => api.get('/reservations', { params }),
  complete:        (id) => api.patch(`/reservations/${id}/complete`),
};

// ── Products ──────────────────────────────────────────────────
export const productApi = {
  getAll:          (params) => api.get('/products', { params }),
  getOne:          (id) => api.get(`/products/${id}`),
  // Admin
  create:          (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:          (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:          (id) => api.delete(`/products/${id}`),
  createVariant:   (id, data) => api.post(`/products/${id}/variants`, data),
  updateStock:     (id, variantId, stock_qty) =>
    api.patch(`/products/${id}/variants/${variantId}/stock`, { stock_qty }),
  getLowStock:     () => api.get('/products/admin/low-stock'),
};

// ── Orders ────────────────────────────────────────────────────
export const orderApi = {
  create:       (data) => api.post('/orders', data),
  capture:      (id, paypalOrderId) =>
    api.post(`/orders/${id}/capture`, { paypal_order_id: paypalOrderId }),
  getMine:      () => api.get('/orders/my'),
  // Admin
  getAll:       (params) => api.get('/orders', { params }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// ── Reviews ───────────────────────────────────────────────────
export const reviewApi = {
  getStats:   () => api.get('/reviews/stats'),
  getPublic:  (params) => api.get('/reviews', { params }),
  create:     (data) => api.post('/reviews', data),
  // Admin
  getAll:     (params) => api.get('/reviews/admin/all', { params }),
  moderate:   (id, data) => api.patch(`/reviews/${id}/moderate`, data),
  remove:     (id) => api.delete(`/reviews/${id}`),
};
