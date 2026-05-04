'use strict';
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../models');

// Générer un access token (courte durée)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Générer et stocker un refresh token (longue durée)
const generateRefreshToken = async (user, deviceInfo = null) => {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours

  await RefreshToken.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    device_info: deviceInfo,
  });

  return rawToken; // On retourne le token brut (jamais stocké en DB)
};

// Vérifier et retourner le refresh token depuis la DB
const verifyRefreshToken = async (rawToken) => {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const tokenRecord = await RefreshToken.findOne({
    where: { token_hash: tokenHash, is_revoked: false },
  });

  if (!tokenRecord || tokenRecord.isExpired()) {
    return null;
  }

  return tokenRecord;
};

// Révoquer un refresh token
const revokeRefreshToken = async (rawToken) => {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await RefreshToken.update(
    { is_revoked: true },
    { where: { token_hash: tokenHash } }
  );
};

// Révoquer tous les tokens d'un user (déconnexion tous appareils)
const revokeAllUserTokens = async (userId) => {
  await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: userId, is_revoked: false } }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
