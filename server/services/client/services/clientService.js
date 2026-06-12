import { v4 as uuidv4 } from 'uuid';
import AppError from '../../../shared/utils/AppError.js';
import logger from '../../../shared/config/logger.js';

/**
 * ClientService - business logic for clients and API key management.
 * Depends on a ClientRepository for all database operations.
 */
export class ClientService {
    /**
     * @param {import('../repository/ClientRepository.js').default} clientRepository
     */
    constructor(clientRepository) {
        if (!clientRepository) throw new Error('ClientService requires clientRepository');
        this.clientRepository = clientRepository;
    }

    // ─── Client Methods ───────────────────────────────────────────────────────

    /**
     * Creates a new client organization.
     * @param {Object} data - { name, email, description?, website?, createdBy }
     * @returns {Promise<Object>} Created client
     */
    async createClient(data) {
        const { name, email, description, website, createdBy } = data;

        if (!name || !email) throw new AppError('name and email are required', 400);
        if (!createdBy) throw new AppError('createdBy (userId) is required', 400);

        // Auto-generate slug from name
        const slug = this._toSlug(name);

        const existing = await this.clientRepository.findBySlug(slug);
        if (existing) throw new AppError('A client with this name already exists', 409);

        return this.clientRepository.createClient({ name, slug, email, description, website, createdBy });
    }

    /**
     * Fetches a single client by ID.
     * @param {string} clientId
     * @returns {Promise<Object>}
     */
    async getClient(clientId) {
        const client = await this.clientRepository.findById(clientId);
        if (!client) throw new AppError('Client not found', 404);
        return client;
    }

    /**
     * Lists all active clients (super_admin only).
     * @returns {Promise<Array>}
     */
    async listClients() {
        return this.clientRepository.findAll();
    }

    // ─── API Key Methods ──────────────────────────────────────────────────────

    /**
     * Creates a new API key for a given client.
     * @param {string} clientId
     * @param {Object} keyData - { name, description?, environment?, createdBy, permissions?, security? }
     * @returns {{ apiKey: Object, rawKey: string }} - rawKey is only returned once
     */
    async createApiKey(clientId, keyData) {
        const client = await this.clientRepository.findById(clientId);
        if (!client) throw new AppError('Client not found', 404);
        if (!client.isActive) throw new AppError('Client is not active', 403);

        const rawKey = this._generateApiKey();
        const keyId = uuidv4();

        const apiKey = await this.clientRepository.createApiKey({
            keyId,
            keyValue: rawKey,
            clientId,
            name: keyData.name,
            description: keyData.description || '',
            environment: keyData.environment || 'production',
            permissions: keyData.permissions || { canIngest: true, canReadAnalytics: false },
            security: keyData.security || { allowedIPs: [], allowedOrigins: [] },
            createdBy: keyData.createdBy,
            metadata: {
                createdBy: keyData.createdBy,
                purpose: keyData.purpose || '',
            },
        });

        logger.info('API key created for client', { clientId, keyId });

        // Return the raw key only once — it will not be readable again
        return { apiKey, rawKey };
    }

    /**
     * Lists API keys for a client (key values excluded).
     * @param {string} clientId
     * @returns {Promise<Array>}
     */
    async listApiKeys(clientId) {
        return this.clientRepository.findApiKeysByClientId(clientId);
    }

    /**
     * Revokes (soft-deletes) an API key.
     * @param {string} keyId
     * @param {string} clientId - Scoped to client for security
     * @returns {Promise<Object>}
     */
    async revokeApiKey(keyId, clientId) {
        const revoked = await this.clientRepository.revokeApiKey(keyId, clientId);
        if (!revoked) throw new AppError('API key not found', 404);
        logger.info('API key revoked', { keyId, clientId });
        return revoked;
    }

    /**
     * Validates an API key from a raw string and returns the associated client.
     * Used by the validateApiKey middleware.
     * @param {string} rawKey
     * @returns {Promise<{ client: Object, apiKey: Object } | null>}
     */
    async getClientByApiKey(rawKey) {
        if (!rawKey) return null;

        const apiKey = await this.clientRepository.findApiKeyByValue(rawKey);
        if (!apiKey) return null;

        const client = await this.clientRepository.findById(apiKey.clientId);
        if (!client) return null;

        return { client, apiKey };
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Generates a cryptographically random API key with a prefix.
     * Format: sk_live_<32 hex chars>
     * @returns {string}
     */
    _generateApiKey() {
        const randomPart = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
        return `sk_live_${randomPart.substring(0, 32)}`;
    }

    /**
     * Converts a name to a URL-safe slug.
     * @param {string} name
     * @returns {string}
     */
    _toSlug(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
}
