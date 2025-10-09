const AuthService = require('../utils/authService');

const authController = {
    // Register new user
    async register(req, res) {
        try {
            const { email, password, firstName, lastName, phone, dateOfBirth, gender, roleId } = req.body;

            // Basic validation
            if (!email || !password || !firstName || !lastName) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, password, first name, and last name are required'
                });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Password validation
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            const user = await AuthService.register({
                email: email.toLowerCase(),
                password,
                firstName,
                lastName,
                phone,
                dateOfBirth,
                gender,
                roleId
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        roleId: user.role_id,
                        isActive: user.is_active,
                        createdAt: user.created_at
                    }
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    },

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const loginResult = await AuthService.login(email.toLowerCase(), password);

            res.json({
                success: true,
                message: 'Login successful',
                data: loginResult
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    },

    // Refresh token
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            const newAccessToken = await AuthService.refreshToken(refreshToken);

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: newAccessToken
                }
            });
        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Token refresh failed'
            });
        }
    },

    // Get current user profile
    async getProfile(req, res) {
        try {
            const user = await AuthService.getUserById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        phone: user.phone,
                        dateOfBirth: user.date_of_birth,
                        gender: user.gender,
                        roleId: user.role_id,
                        roleName: user.role_name,
                        isActive: user.is_active,
                        isVerified: user.is_verified,
                        createdAt: user.created_at,
                        permissions: user.permissions
                    }
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user profile'
            });
        }
    },

    // Update user profile
    async updateProfile(req, res) {
        try {
            const { firstName, lastName, phone, dateOfBirth, gender } = req.body;

            const updatedUser = await AuthService.updateProfile(req.user.id, {
                firstName,
                lastName,
                phone,
                dateOfBirth,
                gender
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        firstName: updatedUser.first_name,
                        lastName: updatedUser.last_name,
                        phone: updatedUser.phone,
                        dateOfBirth: updatedUser.date_of_birth,
                        gender: updatedUser.gender
                    }
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    },

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            await AuthService.changePassword(req.user.id, currentPassword, newPassword);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to change password'
            });
        }
    },

    // Logout (client-side token invalidation)
    async logout(req, res) {
        res.json({
            success: true,
            message: 'Logged out successfully. Please remove the token from client storage.'
        });
    }
};

module.exports = authController;