import ResponseFormatter from '../../../shared/utils/responseFormatter.js';
import AppError from '../../../shared/utils/AppError.js';
import logger from '../../../shared/config/logger.js';

/**
 * ClientController - handles all client and API key HTTP endpoints.
 */
export class ClientController {
    /**
     * @param {import('../services/clientService.js').ClientService} clientService
     */
    constructor(clientService) {
        if (!clientService) throw new Error('ClientController requires clientService');
        this.clientService = clientService;
    }

    // ─── Client Endpoints ─────────────────────────────────────────────────────

    /**
     * POST /api/v1/clients
     * Creates a new client organization. Super admin only.
     */
    async createClient(req, res, next) {
        try {
            const { name, email, description, website } = req.body;
            const createdBy = req.user.userId;

            const client = await this.clientService.createClient({ name, email, description, website, createdBy });

            res.status(201).json(ResponseFormatter.success(client, 'Client created successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/clients
     * Lists all clients. Super admin only.
     */
    async listClients(req, res, next) {
        try {
            const clients = await this.clientService.listClients();
            res.status(200).json(ResponseFormatter.success(clients, 'Clients retrieved successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/clients/:clientId
     * Fetches a single client by ID.
     */
    async getClient(req, res, next) {
        try {
            const { clientId } = req.params;
            const client = await this.clientService.getClient(clientId);
            res.status(200).json(ResponseFormatter.success(client, 'Client retrieved successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    // ─── API Key Endpoints ────────────────────────────────────────────────────

    /**
     * POST /api/v1/clients/:clientId/api-keys
     * Creates a new API key for a client.
     */
    async createApiKey(req, res, next) {
        try {
            const { clientId } = req.params;
            const { name, description, environment, permissions, security, purpose } = req.body;
            const createdBy = req.user.userId;

            if (!name) throw new AppError('API key name is required', 400);

            const { apiKey, rawKey } = await this.clientService.createApiKey(clientId, {
                name,
                description,
                environment,
                permissions,
                security,
                purpose,
                createdBy,
            });

            logger.info('API key created via controller', { clientId, keyId: apiKey.keyId });

            // Include rawKey in response — it will NOT be shown again
            res.status(201).json(ResponseFormatter.success(
                { ...apiKey.toObject(), rawKey },
                'API key created. Save the rawKey — it will not be shown again.',
                201
            ));
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/clients/:clientId/api-keys
     * Lists API keys for a client (key values excluded).
     */
    async listApiKeys(req, res, next) {
        try {
            const { clientId } = req.params;
            const keys = await this.clientService.listApiKeys(clientId);
            res.status(200).json(ResponseFormatter.success(keys, 'API keys retrieved successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/clients/:clientId/api-keys/:keyId
     * Revokes an API key.
     */
    async revokeApiKey(req, res, next) {
        try {
            const { clientId, keyId } = req.params;
            await this.clientService.revokeApiKey(keyId, clientId);
            res.status(200).json(ResponseFormatter.success({}, 'API key revoked successfully', 200));
        } catch (error) {
            next(error);
        }
    }
}
