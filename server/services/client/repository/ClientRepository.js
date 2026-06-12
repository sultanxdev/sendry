import mongoose from 'mongoose';
import Client from '../../../shared/models/Client.js';
import ApiKey from '../../../shared/models/ApiKey.js';
import logger from '../../../shared/config/logger.js';

/**
 * ClientRepository - handles all MongoDB operations for clients and API keys.
 */
class ClientRepository {
    // ─── Client Operations ────────────────────────────────────────────────────

    /**
     * Creates a new client organization.
     * @param {Object} data
     * @returns {Promise<Object>} Created client
     */
    async createClient(data) {
        try {
            const client = new Client(data);
            await client.save();
            logger.info('Client created', { clientId: client._id, name: client.name });
            return client;
        } catch (error) {
            logger.error('Error creating client', error);
            throw error;
        }
    }

    /**
     * Finds a client by its MongoDB ID.
     * @param {string} clientId
     * @returns {Promise<Object|null>}
     */
    async findById(clientId) {
        try {
            return await Client.findById(clientId);
        } catch (error) {
            logger.error('Error finding client by id', error);
            throw error;
        }
    }

    /**
     * Finds a client by slug.
     * @param {string} slug
     * @returns {Promise<Object|null>}
     */
    async findBySlug(slug) {
        try {
            return await Client.findOne({ slug });
        } catch (error) {
            logger.error('Error finding client by slug', error);
            throw error;
        }
    }

    /**
     * Lists all active clients.
     * @returns {Promise<Array>}
     */
    async findAll() {
        try {
            return await Client.find({ isActive: true }).sort({ createdAt: -1 });
        } catch (error) {
            logger.error('Error listing clients', error);
            throw error;
        }
    }

    /**
     * Updates a client by ID.
     * @param {string} clientId
     * @param {Object} updates
     * @returns {Promise<Object|null>}
     */
    async updateById(clientId, updates) {
        try {
            return await Client.findByIdAndUpdate(clientId, updates, { new: true });
        } catch (error) {
            logger.error('Error updating client', error);
            throw error;
        }
    }

    // ─── API Key Operations ───────────────────────────────────────────────────

    /**
     * Creates a new API key for a client.
     * @param {Object} data
     * @returns {Promise<Object>} Created API key
     */
    async createApiKey(data) {
        try {
            const apiKey = new ApiKey(data);
            await apiKey.save();
            logger.info('API key created', { keyId: apiKey.keyId, clientId: apiKey.clientId });
            return apiKey;
        } catch (error) {
            logger.error('Error creating API key', error);
            throw error;
        }
    }

    /**
     * Finds an API key document by its raw key value.
     * @param {string} keyValue
     * @returns {Promise<Object|null>}
     */
    async findApiKeyByValue(keyValue) {
        try {
            return await ApiKey.findOne({ keyValue, isActive: true });
        } catch (error) {
            logger.error('Error finding API key', error);
            throw error;
        }
    }

    /**
     * Lists all API keys for a client.
     * @param {string} clientId
     * @returns {Promise<Array>}
     */
    async findApiKeysByClientId(clientId) {
        try {
            return await ApiKey.find({ clientId }).sort({ createdAt: -1 }).select('-keyValue');
        } catch (error) {
            logger.error('Error listing API keys', error);
            throw error;
        }
    }

    /**
     * Deactivates (soft-deletes) an API key.
     * @param {string} keyId - The keyId field (not MongoDB _id)
     * @param {string} clientId - Scope to client for security
     * @returns {Promise<Object|null>}
     */
    async revokeApiKey(keyId, clientId) {
        try {
            return await ApiKey.findOneAndUpdate(
                { keyId, clientId },
                { isActive: false },
                { new: true }
            );
        } catch (error) {
            logger.error('Error revoking API key', error);
            throw error;
        }
    }
}

export default new ClientRepository();
