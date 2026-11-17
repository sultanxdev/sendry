import BaseClientRepository from "./BaseClientRepository.js";
import Client from "../../../shared/models/Client.js";
import logger from "../../../shared/config/logger.js";
import mongoose from "mongoose";
import memoryStore from "../../../shared/utils/memoryStore.js";

/**
 * MongoClientRepository class to handle database operations related to clients
 * This class extends the BaseClientRepository and provides implementations for creating clients, finding clients by ID or slug, and finding/counting clients based on filters. It uses Mongoose for database interactions with resilient in-memory fallback.
 */
class MongoClientRepository extends BaseClientRepository {
    constructor() {
        super(Client);
    }

    _isDbReady() {
        return mongoose.connection && mongoose.connection.readyState === 1;
    }

    /**
     * Creates a new client
     * @param {Object} clientData 
     * @returns {Promise<Object>}
     */
    async create(clientData) {
        try {
            if (!this._isDbReady()) {
                logger.info("[ClientRepository] Mongo offline: saving client in memory store");
                return await memoryStore.createClient(clientData);
            }

            const client = new this.model(clientData);
            await client.save();

            logger.info('Client created in MongoDB', {
                mongoId: client._id,
                slug: client.slug
            });

            return client;
        } catch (error) {
            logger.error('Error creating client in db', error);
            throw error;
        }
    }

    /**
     * Find a client by ID
     * @param {string} clientId - The ID of the client
     * @returns {Promise<Object|null>} - The client object or null if not found
     */
    async findById(clientId) {
        try {
            if (!this._isDbReady()) {
                return await memoryStore.findClientById(clientId);
            }

            const client = await this.model.findById(clientId);
            logger.info('Client details from MongoDB', client);
            return client;
        } catch (error) {
            logger.error('Error finding client in db by id', error);
            throw error;
        }
    }

    /**
     * Find a client by slug
     * @param {string} slug - The slug of the client
     * @returns {Promise<Object|null>} - The client object or null if not found
     */
    async findBySlug(slug) {
        try {
            if (!this._isDbReady()) {
                return await memoryStore.findClientBySlug(slug);
            }

            const client = await this.model.findOne({ slug });
            return client;
        } catch (error) {
            logger.error('Error finding client by slug:', error);
            throw error;
        }
    }

    /**
     * Find clients with filters and pagination
     * @param {Object} filters - Query filters
     * @param {Object} options - Query options (limit, skip, sort)
     * @returns {Promise<Object>}
     */
    async find(filters = {}, options = {}) {
        try {
            const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

            const clients = await this.model.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select('-__v');

            return clients;
        } catch (error) {
            logger.error('Error finding clients:', error);
            throw error;
        }
    }

    /**
     * Count clients matching filters
     * @param {Object} filters - Query filters
     * @returns {Promise<number>}
     */
    async count(filters = {}) {
        try {
            const count = await this.model.countDocuments(filters);
            return count;
        } catch (error) {
            logger.error('Error counting clients:', error);
            throw error;
        }
    }
}


export default new MongoClientRepository()