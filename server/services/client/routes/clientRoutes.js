import express from 'express';
import clientContainer from '../Dependencies/dependencies.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import authorize from '../../../shared/middlewares/authorize.js';
import validate from '../../../shared/middlewares/validate.js';

const router = express.Router();
const { clientController } = clientContainer.controllers;

// ─── Validation schemas ──────────────────────────────────────────────────────

const createClientSchema = {
    name: { required: true, minLength: 2 },
    email: { required: true },
};

const createApiKeySchema = {
    name: { required: true },
};

// ─── Client routes ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/clients
 * Create a new client organization. Super admin only.
 */
router.post(
    '/',
    authenticate,
    authorize(['super_admin']),
    validate(createClientSchema),
    (req, res, next) => clientController.createClient(req, res, next)
);

/**
 * GET /api/v1/clients
 * List all clients. Super admin only.
 */
router.get(
    '/',
    authenticate,
    authorize(['super_admin']),
    (req, res, next) => clientController.listClients(req, res, next)
);

/**
 * GET /api/v1/clients/:clientId
 * Get a single client. Super admin or client members.
 */
router.get(
    '/:clientId',
    authenticate,
    authorize(['super_admin', 'client_admin', 'client_viewer']),
    (req, res, next) => clientController.getClient(req, res, next)
);

// ─── API Key routes ──────────────────────────────────────────────────────────

/**
 * POST /api/v1/clients/:clientId/api-keys
 * Create an API key. Super admin or client_admin.
 */
router.post(
    '/:clientId/api-keys',
    authenticate,
    authorize(['super_admin', 'client_admin']),
    validate(createApiKeySchema),
    (req, res, next) => clientController.createApiKey(req, res, next)
);

/**
 * GET /api/v1/clients/:clientId/api-keys
 * List API keys for a client. Key values excluded.
 */
router.get(
    '/:clientId/api-keys',
    authenticate,
    authorize(['super_admin', 'client_admin']),
    (req, res, next) => clientController.listApiKeys(req, res, next)
);

/**
 * DELETE /api/v1/clients/:clientId/api-keys/:keyId
 * Revoke an API key.
 */
router.delete(
    '/:clientId/api-keys/:keyId',
    authenticate,
    authorize(['super_admin', 'client_admin']),
    (req, res, next) => clientController.revokeApiKey(req, res, next)
);

export default router;
