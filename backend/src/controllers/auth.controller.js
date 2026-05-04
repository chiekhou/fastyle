'use strict';
const crypto = require('crypto');
const { User } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} = require('../utils/jwt.utils');
const { sendVerificationEmail } = require('../utils/email.utils');
const { success, created } = require('../utils/response.utils');
const { AppError } = require('../middlewares/error.middleware');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone } = req.body;

    const exists = await User.scope('withPassword').findOne({ where: { email } });
    if (exists) throw new AppError('Cet email est déjà utilisé.', 409);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await User.create({
      email,
      password_hash: password,
      full_name,
      phone,
      role: 'client',
      email_verified: false,
      email_verification_token: verificationToken,
    });

    sendVerificationEmail({ email, full_name }, verificationToken).catch(console.error);

    return created(res, {}, 'Compte créé. Vérifiez votre email pour activer votre compte.');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/verify-email?token=xxx
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) throw new AppError('Token manquant.', 400);

    const user = await User.unscoped().findOne({
      where: { email_verification_token: token },
    });

    if (!user) throw new AppError('Lien invalide ou déjà utilisé.', 400);

    await user.update({ email_verified: true, email_verification_token: null });

    return success(res, {}, 'Email vérifié. Vous pouvez maintenant vous connecter.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user || !user.is_active) {
      throw new AppError('Email ou mot de passe incorrect.', 401);
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) throw new AppError('Email ou mot de passe incorrect.', 401);

    if (!user.email_verified) {
      throw new AppError('Veuillez vérifier votre email avant de vous connecter.', 403);
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, req.headers['user-agent']);

    const { password_hash, email_verification_token, ...userSafe } = user.toJSON();

    return success(res, { user: userSafe, accessToken, refreshToken }, 'Connexion réussie.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token manquant.', 400);

    const tokenRecord = await verifyRefreshToken(refreshToken);
    if (!tokenRecord) throw new AppError('Refresh token invalide ou expiré.', 401);

    const user = await User.findByPk(tokenRecord.user_id);
    if (!user || !user.is_active) throw new AppError('Utilisateur introuvable.', 401);

    await revokeRefreshToken(refreshToken);
    const newAccessToken  = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user, req.headers['user-agent']);

    return success(res, { accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await revokeRefreshToken(refreshToken);
    return success(res, {}, 'Déconnexion réussie.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout-all
const logoutAll = async (req, res, next) => {
  try {
    await revokeAllUserTokens(req.user.id);
    return success(res, {}, 'Déconnexion de tous les appareils.');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    return success(res, { user: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyEmail, login, refresh, logout, logoutAll, me };
