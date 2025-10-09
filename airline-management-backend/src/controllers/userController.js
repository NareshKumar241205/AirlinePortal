const { query } = require('../config/database');
const AuthService = require('../utils/authService');

const userController = {
    // Get all users (Super Admin only)
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, search = '', role = '' } = req.query;
            const offset = (page - 1) * limit;

            let whereConditions = [];
            let queryParams = [];
            let paramCount = 0;

            // Search functionality
            if (search) {
                paramCount++;
                whereConditions.push(`(u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
                queryParams.push(`%${search}%`);
            }

            // Role filter
            if (role) {
                paramCount++;
                whereConditions.push(`r.name = $${paramCount}`);
                queryParams.push(role);
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total
                FROM users u
                JOIN roles r ON u.role_id = r.id
                ${whereClause}
            `;
            const countResult = await query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].total);

            // Get users with pagination
            paramCount++;
            queryParams.push(limit);
            paramCount++;
            queryParams.push(offset);

            const usersQuery = `
                SELECT u.id, u.email, u.first_name, u.last_name, u.phone, 
                       u.date_of_birth, u.gender, u.role_id, u.is_active, 
                       u.is_verified, u.last_login, u.created_at, 
                       r.name as role_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                ${whereClause}
                ORDER BY u.created_at DESC
                LIMIT $${paramCount - 1} OFFSET $${paramCount}
            `;

            const usersResult = await query(usersQuery, queryParams);

            res.json({
                success: true,
                data: {
                    users: usersResult.rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve users'
            });
        }
    },

    // Get user by ID
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            
            const user = await AuthService.getUserById(id);
            
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
            console.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user'
            });
        }
    },

    // Update user role (Super Admin only)
    async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { roleId } = req.body;

            if (!roleId) {
                return res.status(400).json({
                    success: false,
                    message: 'Role ID is required'
                });
            }

            // Verify role exists
            const roleResult = await query('SELECT id, name FROM roles WHERE id = $1', [roleId]);
            if (roleResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            // Update user role
            const result = await query(`
                UPDATE users 
                SET role_id = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, email, first_name, last_name, role_id
            `, [roleId, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'User role updated successfully',
                data: {
                    user: {
                        id: result.rows[0].id,
                        email: result.rows[0].email,
                        firstName: result.rows[0].first_name,
                        lastName: result.rows[0].last_name,
                        roleId: result.rows[0].role_id,
                        newRoleName: roleResult.rows[0].name
                    }
                }
            });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user role'
            });
        }
    },

    // Activate/Deactivate user (Super Admin only)
    async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            if (typeof isActive !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'isActive must be a boolean value'
                });
            }

            const result = await query(`
                UPDATE users 
                SET is_active = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, email, first_name, last_name, is_active
            `, [isActive, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: {
                    user: result.rows[0]
                }
            });
        } catch (error) {
            console.error('Toggle user status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user status'
            });
        }
    },

    // Delete user (Super Admin only)
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Prevent deletion of super admin
            const userCheck = await query(`
                SELECT u.id, r.name as role_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = $1
            `, [id]);

            if (userCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (userCheck.rows[0].role_name === 'super_admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot delete super admin user'
                });
            }

            // Check for dependencies before deletion
            const dependencyCheck = await query(`
                SELECT 
                    (SELECT COUNT(*) FROM airlines WHERE admin_user_id = $1) as airline_count,
                    (SELECT COUNT(*) FROM crew_members WHERE user_id = $1) as crew_count,
                    (SELECT COUNT(*) FROM bookings WHERE user_id = $1) as booking_count
            `, [id]);

            const dependencies = dependencyCheck.rows[0];
            if (dependencies.airline_count > 0 || dependencies.crew_count > 0 || dependencies.booking_count > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Cannot delete user with existing airlines, crew assignments, or bookings'
                });
            }

            // Delete user
            const deleteResult = await query('DELETE FROM users WHERE id = $1 RETURNING id, email', [id]);

            res.json({
                success: true,
                message: 'User deleted successfully',
                data: {
                    deletedUser: deleteResult.rows[0]
                }
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }
    },

    // Get all roles
    async getRoles(req, res) {
        try {
            const result = await query(
                'SELECT id, name, description FROM roles ORDER BY name'
            );

            res.json({
                success: true,
                data: {
                    roles: result.rows
                }
            });
        } catch (error) {
            console.error('Get roles error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve roles'
            });
        }
    },

    // Get user statistics (Super Admin only)
    async getUserStats(req, res) {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
                    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
                    COUNT(CASE WHEN r.name = 'customer' THEN 1 END) as customers,
                    COUNT(CASE WHEN r.name = 'airline_admin' THEN 1 END) as airline_admins,
                    COUNT(CASE WHEN r.name = 'crew_member' THEN 1 END) as crew_members,
                    COUNT(CASE WHEN r.name = 'super_admin' THEN 1 END) as super_admins
                FROM users u
                JOIN roles r ON u.role_id = r.id
            `;

            const result = await query(statsQuery);
            const stats = result.rows[0];

            // Convert string numbers to integers
            Object.keys(stats).forEach(key => {
                stats[key] = parseInt(stats[key]);
            });

            res.json({
                success: true,
                data: {
                    stats
                }
            });
        } catch (error) {
            console.error('Get user stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user statistics'
            });
        }
    }
};

module.exports = userController;