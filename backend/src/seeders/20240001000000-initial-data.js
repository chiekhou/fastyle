'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const adminId     = uuidv4();
    const passwordHash = await bcrypt.hash('Admin@fastyle2024!', 12);

    // ── Admin ──────────────────────────────────────────────
    await queryInterface.bulkInsert('users', [{
      id: adminId,
      email: 'admin@fastyle.fr',
      password_hash: passwordHash,
      full_name: 'Administratrice FaStyle',
      phone: null,
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    // ── Prestations ────────────────────────────────────────
    const serviceIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    await queryInterface.bulkInsert('services', [
      { id: serviceIds[0], name: 'Soin du visage',         description: 'Nettoyage profond, gommage et masque hydratant.',               duration_minutes: 60, price: 55.00, image_url: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: serviceIds[1], name: 'Épilation sourcils',     description: 'Mise en forme et épilation des sourcils au fil.',               duration_minutes: 20, price: 15.00, image_url: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: serviceIds[2], name: 'Maquillage événement',   description: 'Maquillage complet pour mariages et occasions spéciales.',      duration_minutes: 90, price: 80.00, image_url: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: serviceIds[3], name: 'Manucure',               description: 'Soin des ongles, pose vernis semi-permanent.',                 duration_minutes: 45, price: 35.00, image_url: null, is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);

    // ── Créneaux 30 jours ──────────────────────────────────
    const slots   = [];
    const periods = ['morning', 'afternoon', 'evening'];
    const today   = new Date();

    for (let i = 1; i <= 30; i++) {
      const date      = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0=dim, 6=sam
      const dateStr   = date.toISOString().split('T')[0];

      if (dayOfWeek === 0) continue; // Fermé dimanche

      for (const period of periods) {
        if (dayOfWeek === 6 && period === 'evening') continue; // Pas de soir le samedi
        slots.push({
          id:           uuidv4(),
          date:         dateStr,
          period,
          service_id:   null,
          is_blocked:   false,
          block_reason: null,
          created_at:   new Date(),
          updated_at:   new Date(),
        });
      }
    }

    await queryInterface.bulkInsert('slots', slots);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('slots',    null, {});
    await queryInterface.bulkDelete('services', null, {});
    await queryInterface.bulkDelete('users',    { role: 'admin' }, {});
  },
};
