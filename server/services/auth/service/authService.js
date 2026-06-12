import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../../shared/config/index.js';
import AppError from '../../../shared/utils/AppError.js';
import logger from '../../../shared/config/logger.js';

/**
 * AuthService - Business logic for authentication and user management.
 * Depends on a UserRepository for all database access.
 */
export class AuthService {
    /**
     * @param {import('../repository/UserRepository.js').default} userRepository
     */
    constructor(userRepository) {
        if (!userRepository) throw new Error('AuthService requires userRepository');
        this.userRepository = userRepository;
    }

    // ─── Private Helpers ────────────────────────────────────────────────────────

    /**
     * Signs a JWT for the given user and returns it as a string.
     * @param {Object} user - Mongoose user document
     * @returns {string}
     */
    _signToken(user) {
        return jwt.sign(
            {
                userId: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                clientId: user.clientId ?? null,
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
    }

    /**
     * Strips the password field from a user object for safe serialization.
     * @param {Object} user
     * @returns {Object}
     */
    _sanitizeUser(user) {
        const obj = user.toObject ? user.toObject() : { ...user };
        delete obj.password;
        return obj;
    }

    // ─── Public Methods ──────────────────────────────────────────────────────────

    /**
     * Creates the very first super admin. Throws if one already exists.
     * @param {Object} data - { username, email, password, role }
     * @returns {{ user: Object, token: string }}
     */
    async onboardSuperAdmin(data) {
        const existing = await this.userRepository.findAll();
        const hasSuperAdmin = existing.some(u => u.role === 'super_admin');

        if (hasSuperAdmin) {
            throw new AppError('Super admin already exists', 409);
        }

        const user = await this.userRepository.create({
            ...data,
            role: 'super_admin',
            permissions: {
                canCreateApiKeys: true,
                canManageUsers: true,
                canViewAnalytics: true,
                canExportData: true,
            },
        });

        const token = this._signToken(user);
        logger.info('Super admin onboarded', { userId: user._id });

        return { user: this._sanitizeUser(user), token };
    }

    /**
     * Registers a new user (client_admin or client_viewer).
     * A clientId must be provided for non-super-admin roles.
     * @param {Object} userData - { username, email, password, role, clientId }
     * @returns {{ user: Object, token: string }}
     */
    async register(userData) {
        const { username, email, password, role, clientId } = userData;

        // Prevent duplicate super_admin creation via register
        if (role === 'super_admin') {
            throw new AppError('Use /onboard-super-admin to create a super admin', 400);
        }

        if (!clientId) {
            throw new AppError('clientId is required for non-super-admin users', 400);
        }

        // Check for existing user
        const existingByEmail = await this.userRepository.findByEmail(email);
        if (existingByEmail) {
            throw new AppError('Email already in use', 409);
        }

        const existingByUsername = await this.userRepository.findByUsername(username);
        if (existingByUsername) {
            throw new AppError('Username already taken', 409);
        }

        const user = await this.userRepository.create({
            username,
            email,
            password,
            role: role || 'client_viewer',
            clientId,
        });

        const token = this._signToken(user);
        logger.info('User registered', { userId: user._id, role: user.role });

        return { user: this._sanitizeUser(user), token };
    }

    /**
     * Authenticates a user with username + password, returns JWT.
     * @param {string} username
     * @param {string} password
     * @returns {{ user: Object, token: string }}
     */
    async login(username, password) {
        if (!username || !password) {
            throw new AppError('Username and password are required', 400);
        }

        const user = await this.userRepository.findByUsername(username);

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        if (!user.isActive) {
            throw new AppError('Account is deactivated', 403);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = this._signToken(user);
        logger.info('User logged in', { userId: user._id });

        return { user: this._sanitizeUser(user), token };
    }

    /**
     * Fetches a user's full profile (minus password).
     * @param {string} userId
     * @returns {Object} User profile
     */
    async getProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return this._sanitizeUser(user);
    }

    /**
     * Updates allowed profile fields for a user.
     * @param {string} userId
     * @param {Object} updates - Fields to update (username, email)
     * @returns {Object} Updated user
     */
    async updateProfile(userId, updates) {
        const allowedFields = ['username', 'email'];
        const sanitizedUpdates = {};

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                sanitizedUpdates[field] = updates[field];
            }
        }

        if (Object.keys(sanitizedUpdates).length === 0) {
            throw new AppError('No valid fields to update', 400);
        }

        const updated = await this.userRepository.updateById(userId, sanitizedUpdates);
        if (!updated) throw new AppError('User not found', 404);

        return updated;
    }

    /**
     * Validates current password and replaces it with a new one.
     * @param {string} userId
     * @param {string} currentPassword
     * @param {string} newPassword
     */
    async changePassword(userId, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            throw new AppError('Current and new passwords are required', 400);
        }

        const user = await this.userRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) throw new AppError('Current password is incorrect', 401);

        if (currentPassword === newPassword) {
            throw new AppError('New password must differ from current password', 400);
        }

        // Directly set and save so the pre-save bcrypt hook runs
        user.password = newPassword;
        await user.save();

        logger.info('Password changed', { userId });
    }

    /**
     * Checks if the given userId belongs to a super_admin.
     * Used by AnalyticsController for permission checks.
     * @param {string} userId
     * @returns {boolean}
     */
    async checkSuperAdminPermissions(userId) {
        const user = await this.userRepository.findById(userId);
        return user?.role === 'super_admin';
    }
}
