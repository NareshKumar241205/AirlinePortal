const { query } = require('../config/database');

const airlineController = {
    // Register new airline (Airline Admin only)
    async registerAirline(req, res) {
        try {
            const {
                name,
                code,
                country,
                headquartersAddress,
                contactEmail,
                contactPhone,
                websiteUrl,
                logoUrl,
                description
            } = req.body;

            // Validation
            if (!name || !code || !country) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, code, and country are required'
                });
            }

            // Check if airline code is unique
            const existingAirline = await query(
                'SELECT id FROM airlines WHERE code = $1',
                [code.toUpperCase()]
            );

            if (existingAirline.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Airline code already exists'
                });
            }

            // Check if user already has an airline
            const userAirline = await query(
                'SELECT id FROM airlines WHERE admin_user_id = $1',
                [req.user.id]
            );

            if (userAirline.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'User already has an airline registered'
                });
            }

            // Insert new airline
            const result = await query(`
                INSERT INTO airlines (
                    name, code, country, headquarters_address, contact_email,
                    contact_phone, website_url, logo_url, description, admin_user_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, [
                name,
                code.toUpperCase(),
                country,
                headquartersAddress,
                contactEmail,
                contactPhone,
                websiteUrl,
                logoUrl,
                description,
                req.user.id
            ]);

            res.status(201).json({
                success: true,
                message: 'Airline registered successfully. Awaiting approval from Super Admin.',
                data: {
                    airline: result.rows[0]
                }
            });
        } catch (error) {
            console.error('Airline registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to register airline'
            });
        }
    },

    // Get all airlines (with pagination and filtering)
    async getAllAirlines(req, res) {
        try {
            const { page = 1, limit = 10, search = '', status = '', country = '' } = req.query;
            const offset = (page - 1) * limit;

            let whereConditions = [];
            let queryParams = [];
            let paramCount = 0;

            // Search functionality
            if (search) {
                paramCount++;
                whereConditions.push(`(a.name ILIKE $${paramCount} OR a.code ILIKE $${paramCount})`);
                queryParams.push(`%${search}%`);
            }

            // Status filter
            if (status) {
                paramCount++;
                whereConditions.push(`a.approval_status = $${paramCount}`);
                queryParams.push(status);
            }

            // Country filter
            if (country) {
                paramCount++;
                whereConditions.push(`a.country ILIKE $${paramCount}`);
                queryParams.push(`%${country}%`);
            }

            // Role-based filtering
            if (req.user.roleName === 'airline_admin') {
                paramCount++;
                whereConditions.push(`a.admin_user_id = $${paramCount}`);
                queryParams.push(req.user.id);
            } else if (req.user.roleName === 'customer' || req.user.roleName === 'crew_member') {
                whereConditions.push(`a.approval_status = 'approved'`);
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total
                FROM airlines a
                ${whereClause}
            `;
            const countResult = await query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].total);

            // Get airlines with pagination
            paramCount++;
            queryParams.push(limit);
            paramCount++;
            queryParams.push(offset);

            const airlinesQuery = `
                SELECT a.*, 
                       u.first_name as admin_first_name, 
                       u.last_name as admin_last_name,
                       u.email as admin_email
                FROM airlines a
                LEFT JOIN users u ON a.admin_user_id = u.id
                ${whereClause}
                ORDER BY a.created_at DESC
                LIMIT $${paramCount - 1} OFFSET $${paramCount}
            `;

            const airlinesResult = await query(airlinesQuery, queryParams);

            res.json({
                success: true,
                data: {
                    airlines: airlinesResult.rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get airlines error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve airlines'
            });
        }
    },

    // Get airline by ID
    async getAirlineById(req, res) {
        try {
            const { id } = req.params;

            let airlineQuery = `
                SELECT a.*, 
                       u.first_name as admin_first_name, 
                       u.last_name as admin_last_name,
                       u.email as admin_email,
                       approver.first_name as approved_by_first_name,
                       approver.last_name as approved_by_last_name
                FROM airlines a
                LEFT JOIN users u ON a.admin_user_id = u.id
                LEFT JOIN users approver ON a.approved_by = approver.id
                WHERE a.id = $1
            `;

            // Role-based access control
            if (req.user.roleName === 'airline_admin') {
                airlineQuery += ' AND a.admin_user_id = $2';
                const result = await query(airlineQuery, [id, req.user.id]);
                
                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Airline not found or access denied'
                    });
                }

                return res.json({
                    success: true,
                    data: { airline: result.rows[0] }
                });
            } else if (req.user.roleName === 'customer' || req.user.roleName === 'crew_member') {
                airlineQuery += ' AND a.approval_status = \'approved\'';
            }

            const result = await query(airlineQuery, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Airline not found'
                });
            }

            res.json({
                success: true,
                data: { airline: result.rows[0] }
            });
        } catch (error) {
            console.error('Get airline by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve airline'
            });
        }
    },

    // Update airline (Airline Admin only)
    async updateAirline(req, res) {
        try {
            const { id } = req.params;
            const {
                name,
                country,
                headquartersAddress,
                contactEmail,
                contactPhone,
                websiteUrl,
                logoUrl,
                description
            } = req.body;

            const result = await query(`
                UPDATE airlines 
                SET name = COALESCE($1, name),
                    country = COALESCE($2, country),
                    headquarters_address = COALESCE($3, headquarters_address),
                    contact_email = COALESCE($4, contact_email),
                    contact_phone = COALESCE($5, contact_phone),
                    website_url = COALESCE($6, website_url),
                    logo_url = COALESCE($7, logo_url),
                    description = COALESCE($8, description),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $9 AND admin_user_id = $10
                RETURNING *
            `, [
                name,
                country,
                headquartersAddress,
                contactEmail,
                contactPhone,
                websiteUrl,
                logoUrl,
                description,
                id,
                req.user.id
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Airline not found or access denied'
                });
            }

            res.json({
                success: true,
                message: 'Airline updated successfully',
                data: { airline: result.rows[0] }
            });
        } catch (error) {
            console.error('Update airline error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update airline'
            });
        }
    },

    // Approve/Reject airline (Super Admin only)
    async updateAirlineApproval(req, res) {
        try {
            const { id } = req.params;
            const { approvalStatus, rejectionReason } = req.body;

            if (!approvalStatus || !['approved', 'rejected'].includes(approvalStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid approval status (approved/rejected) is required'
                });
            }

            if (approvalStatus === 'rejected' && !rejectionReason) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required when rejecting an airline'
                });
            }

            let updateData = {
                approval_status: approvalStatus,
                approved_by: req.user.id,
                approved_at: 'CURRENT_TIMESTAMP'
            };

            if (approvalStatus === 'rejected') {
                updateData.rejection_reason = rejectionReason;
                updateData.approved_at = null;
            }

            const result = await query(`
                UPDATE airlines 
                SET approval_status = $1,
                    approved_by = $2,
                    approved_at = ${approvalStatus === 'approved' ? 'CURRENT_TIMESTAMP' : 'NULL'},
                    rejection_reason = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *
            `, [
                approvalStatus,
                req.user.id,
                approvalStatus === 'rejected' ? rejectionReason : null,
                id
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Airline not found'
                });
            }

            res.json({
                success: true,
                message: `Airline ${approvalStatus} successfully`,
                data: { airline: result.rows[0] }
            });
        } catch (error) {
            console.error('Update airline approval error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update airline approval status'
            });
        }
    },

    // Delete airline (Super Admin only)
    async deleteAirline(req, res) {
        try {
            const { id } = req.params;

            // Check for dependencies
            const dependencyCheck = await query(`
                SELECT 
                    (SELECT COUNT(*) FROM flights WHERE airline_id = $1) as flight_count,
                    (SELECT COUNT(*) FROM crew_members WHERE airline_id = $1) as crew_count
            `, [id]);

            const dependencies = dependencyCheck.rows[0];
            if (dependencies.flight_count > 0 || dependencies.crew_count > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Cannot delete airline with existing flights or crew members'
                });
            }

            const result = await query(
                'DELETE FROM airlines WHERE id = $1 RETURNING id, name, code',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Airline not found'
                });
            }

            res.json({
                success: true,
                message: 'Airline deleted successfully',
                data: { deletedAirline: result.rows[0] }
            });
        } catch (error) {
            console.error('Delete airline error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete airline'
            });
        }
    },

    // Get airline statistics
    async getAirlineStats(req, res) {
        try {
            let statsQuery;
            let queryParams = [];

            if (req.user.roleName === 'super_admin') {
                // Super admin can see all stats
                statsQuery = `
                    SELECT 
                        COUNT(*) as total_airlines,
                        COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_airlines,
                        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_airlines,
                        COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END) as rejected_airlines
                    FROM airlines
                `;
            } else {
                // Other roles see limited stats
                statsQuery = `
                    SELECT 
                        COUNT(*) as total_airlines
                    FROM airlines
                    WHERE approval_status = 'approved'
                `;
            }

            const result = await query(statsQuery, queryParams);
            const stats = result.rows[0];

            // Convert string numbers to integers
            Object.keys(stats).forEach(key => {
                stats[key] = parseInt(stats[key]);
            });

            res.json({
                success: true,
                data: { stats }
            });
        } catch (error) {
            console.error('Get airline stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve airline statistics'
            });
        }
    }
};

module.exports = airlineController;