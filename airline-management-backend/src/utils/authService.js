const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { query } = require('../config/database');

class AuthService {
    // Hash password
    static async hashPassword(password) {
        return await bcrypt.hash(password, config.bcrypt.saltRounds);
    }

    // Compare password
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Generate JWT token
    static generateToken(payload) {
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn
        });
    }

    // Generate refresh token
    static generateRefreshToken(payload) {
        return jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn
        });
    }

    // Verify JWT token
    static verifyToken(token) {
        return jwt.verify(token, config.jwt.secret);
    }

    // Verify refresh token
    static verifyRefreshToken(token) {
        return jwt.verify(token, config.jwt.refreshSecret);
    }

    // Register new user
    static async register(userData) {
        const { email, password, firstName, lastName, phone, dateOfBirth, gender, roleId = 4 } = userData;

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Insert new user
        const result = await query(`
            INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, gender, role_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, email, first_name, last_name, role_id, is_active, created_at
        `, [email, passwordHash, firstName, lastName, phone, dateOfBirth, gender, roleId]);

        return result.rows[0];
    }

    // Login user
    static async login(email, password) {
        // Get user with role information
        const result = await query(`
            SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, 
                   u.role_id, u.is_active, u.is_verified, u.failed_login_attempts, 
                   u.locked_until, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `, [email]);

        if (result.rows.length === 0) {
            throw new Error('Invalid email or password');
        }

        const user = result.rows[0];

        // Check if account is locked
        if (user.locked_until && new Date() < new Date(user.locked_until)) {
            const lockoutTime = Math.ceil((new Date(user.locked_until) - new Date()) / (1000 * 60));
            throw new Error(`Account is locked. Try again in ${lockoutTime} minutes`);
        }

        // Check if account is active
        if (!user.is_active) {
            throw new Error('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await this.comparePassword(password, user.password_hash);
        
        if (!isPasswordValid) {
            // Increment failed login attempts
            const failedAttempts = user.failed_login_attempts + 1;
            let lockoutTime = null;

            if (failedAttempts >= config.auth.maxLoginAttempts) {
                lockoutTime = new Date(Date.now() + config.auth.lockoutTimeHours * 60 * 60 * 1000);
            }

            await query(
                'UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
                [failedAttempts, lockoutTime, user.id]
            );

            if (lockoutTime) {
                throw new Error('Account locked due to too many failed login attempts');
            }

            throw new Error('Invalid email or password');
        }

        // Reset failed login attempts and update last login
        await query(
            'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Generate tokens
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role_id: user.role_id,
            role_name: user.role_name
        };

        const accessToken = this.generateToken(tokenPayload);
        const refreshToken = this.generateRefreshToken({ id: user.id });

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                roleId: user.role_id,
                roleName: user.role_name,
                isActive: user.is_active,
                isVerified: user.is_verified
            },
            accessToken,
            refreshToken
        };
    }

    // Refresh token
    static async refreshToken(refreshToken) {
        try {
            const decoded = this.verifyRefreshToken(refreshToken);
            
            // Get current user data
            const result = await query(`
                SELECT u.id, u.email, u.role_id, u.is_active, r.name as role_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = $1 AND u.is_active = true
            `, [decoded.id]);

            if (result.rows.length === 0) {
                throw new Error('User not found or inactive');
            }

            const user = result.rows[0];
            const tokenPayload = {
                id: user.id,
                email: user.email,
                role_id: user.role_id,
                role_name: user.role_name
            };

            return this.generateToken(tokenPayload);
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    // Get user by ID with role
    static async getUserById(userId) {
        const result = await query(`
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone, 
                   u.date_of_birth, u.gender, u.role_id, u.is_active, 
                   u.is_verified, u.created_at, r.name as role_name, r.permissions
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `, [userId]);

        return result.rows[0] || null;
    }

    // Change password
    static async changePassword(userId, currentPassword, newPassword) {
        // Get current password hash
        const result = await query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = result.rows[0];

        // Verify current password
        const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password_hash);
        
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await this.hashPassword(newPassword);

        // Update password
        await query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newPasswordHash, userId]
        );

        return true;
    }

    // Update user profile
    static async updateProfile(userId, profileData) {
        const { firstName, lastName, phone, dateOfBirth, gender } = profileData;

        const result = await query(`
            UPDATE users 
            SET first_name = $1, last_name = $2, phone = $3, 
                date_of_birth = $4, gender = $5, updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING id, email, first_name, last_name, phone, date_of_birth, gender
        `, [firstName, lastName, phone, dateOfBirth, gender, userId]);

        return result.rows[0];
    }
}

module.exports = AuthService;