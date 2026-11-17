import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import logger from '../config/logger.js';

class MemoryStore {
    constructor() {
        this.users = new Map();
        this.clients = new Map();
        this.apiKeys = new Map();
        this.apiHits = [];
        logger.info('In-memory store initialized');
    }

    _generateId() {
        return crypto.randomBytes(12).toString('hex');
    }

    async createUser(userData) {
        const id = userData._id ? userData._id.toString() : this._generateId();
        let hashedPassword = userData.password;
        if (hashedPassword && !hashedPassword.startsWith('$2')) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(hashedPassword, salt);
        }

        const userDoc = {
            _id: id,
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || 'client_viewer',
            clientId: userData.clientId ? userData.clientId.toString() : null,
            permissions: userData.permissions || {
                canCreateApiKeys: true,
                canManageUsers: true,
                canViewAnalytics: true,
                canExportData: true,
            },
            isActive: userData.isActive !== false,
            createdAt: new Date(),
            updatedAt: new Date(),
            toObject() {
                const copy = { ...this };
                delete copy.toObject;
                return copy;
            }
        };

        this.users.set(id, userDoc);
        return userDoc;
    }

    async findUserById(id) {
        if (!id) return null;
        return this.users.get(id.toString()) || null;
    }

    async findUserByUsername(username) {
        if (!username) return null;
        for (const user of this.users.values()) {
            if (user.username.toLowerCase() === username.toLowerCase()) return user;
        }
        return null;
    }

    async findUserByEmail(email) {
        if (!email) return null;
        for (const user of this.users.values()) {
            if (user.email.toLowerCase() === email.toLowerCase()) return user;
        }
        return null;
    }

    async findAllUsers() {
        return Array.from(this.users.values()).filter(u => u.isActive);
    }

    async createClient(clientData) {
        const id = clientData._id ? clientData._id.toString() : this._generateId();
        const clientDoc = {
            _id: id,
            name: clientData.name,
            slug: clientData.slug,
            email: clientData.email,
            description: clientData.description || '',
            website: clientData.website || '',
            createdBy: clientData.createdBy ? clientData.createdBy.toString() : null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            toObject() {
                const copy = { ...this };
                delete copy.toObject;
                return copy;
            }
        };
        this.clients.set(id, clientDoc);
        return clientDoc;
    }

    async findClientById(id) {
        if (!id) return null;
        return this.clients.get(id.toString()) || null;
    }

    async findClientBySlug(slug) {
        if (!slug) return null;
        for (const client of this.clients.values()) {
            if (client.slug === slug) return client;
        }
        return null;
    }

    async createApiKey(keyData) {
        const id = keyData._id ? keyData._id.toString() : this._generateId();
        const keyDoc = {
            _id: id,
            keyId: keyData.keyId || crypto.randomUUID(),
            keyValue: keyData.keyValue,
            clientId: keyData.clientId ? keyData.clientId.toString() : null,
            name: keyData.name,
            description: keyData.description || '',
            environment: keyData.environment || 'production',
            isActive: true,
            permissions: keyData.permissions || { canIngest: true, canReadAnalytics: false },
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            isExpired() {
                return this.expiresAt && new Date() > this.expiresAt;
            },
            toObject() {
                const copy = { ...this };
                delete copy.toObject;
                delete copy.isExpired;
                return copy;
            }
        };
        this.apiKeys.set(keyDoc.keyId, keyDoc);
        return keyDoc;
    }

    async findApiKeyByValue(keyValue) {
        for (const key of this.apiKeys.values()) {
            if (key.keyValue === keyValue) {
                // Return key with populated client
                const client = await this.findClientById(key.clientId);
                return {
                    ...key,
                    clientId: client || { _id: key.clientId, name: 'Default Client', isActive: true }
                };
            }
        }
        return null;
    }

    async findApiKeysByClientId(clientId) {
        const idStr = clientId ? clientId.toString() : '';
        const list = [];
        for (const key of this.apiKeys.values()) {
            if (key.clientId && key.clientId.toString() === idStr) {
                list.push(key);
            }
        }
        return list;
    }

    async saveApiHit(hitData) {
        this.apiHits.push({
            ...hitData,
            _id: this._generateId(),
            createdAt: new Date()
        });
        if (this.apiHits.length > 5000) {
            this.apiHits.shift();
        }
        return true;
    }
}

const memoryStore = new MemoryStore();
export default memoryStore;

