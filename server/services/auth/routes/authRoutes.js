import express from 'express';
import authContainer from '../Dependencies/dependencies.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import authorize from '../../../shared/middlewares/authorize.js';
import validate from '../../../shared/middlewares/validate.js';

const router = express.Router();
const { authController } = authContainer.controller;

// ─── Validation Schemas ─────────────────────────────────────────────────────

const registerSchema = {
    username: { required: true, minLength: 3 },
    email: { required: true },
    password: { required: true, minLength: 8 },
};

const loginSchema = {
    username: { required: true },
    password: { required: true },
};

const changePasswordSchema = {
    currentPassword: { required: true },
    newPassword: { required: true, minLength: 8 },
};

// ─── Public Routes ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/onboard-super-admin
 * Creates the first super admin. Fails if one already exists.
 */
router.post(
    '/onboard-super-admin',
    validate(registerSchema),
    (req, res, next) => authController.onboardSuperAdmin(req, res, next)
);

/**
 * POST /api/v1/auth/login
 * Returns a JWT in an httpOnly cookie.
 */
router.post(
    '/login',
    validate(loginSchema),
    (req, res, next) => authController.login(req, res, next)
);

// ─── Admin-only Routes ───────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Creates a new client_admin or client_viewer. Requires super_admin or client_admin.
 */
router.post(
    '/register',
    authenticate,
    authorize(['super_admin', 'client_admin']),
    validate(registerSchema),
    (req, res, next) => authController.register(req, res, next)
);

// ─── Authenticated Routes ────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/profile
 */
router.get(
    '/profile',
    authenticate,
    (req, res, next) => authController.getProfile(req, res, next)
);

/**
 * PATCH /api/v1/auth/profile
 */
router.patch(
    '/profile',
    authenticate,
    (req, res, next) => authController.updateProfile(req, res, next)
);

/**
 * POST /api/v1/auth/change-password
 */
router.post(
    '/change-password',
    authenticate,
    validate(changePasswordSchema),
    (req, res, next) => authController.changePassword(req, res, next)
);

/**
 * POST /api/v1/auth/logout
 */
router.post(
    '/logout',
    authenticate,
    (req, res, next) => authController.logout(req, res, next)
);

export default router;
