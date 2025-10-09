const Joi = require('joi');

// Validation schemas
const schemas = {
    // User registration validation
    userRegistration: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),
        firstName: Joi.string().min(2).max(50).required().messages({
            'string.min': 'First name must be at least 2 characters long',
            'string.max': 'First name cannot exceed 50 characters',
            'any.required': 'First name is required'
        }),
        lastName: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Last name must be at least 2 characters long',
            'string.max': 'Last name cannot exceed 50 characters',
            'any.required': 'Last name is required'
        }),
        phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional().messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),
        dateOfBirth: Joi.date().max('now').optional(),
        gender: Joi.string().valid('male', 'female', 'other').optional(),
        roleId: Joi.number().integer().min(1).optional()
    }),

    // User login validation
    userLogin: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    // Airline registration validation
    airlineRegistration: Joi.object({
        name: Joi.string().min(2).max(200).required(),
        code: Joi.string().length(3).pattern(/^[A-Z]{3}$/).required().messages({
            'string.length': 'Airline code must be exactly 3 characters',
            'string.pattern.base': 'Airline code must contain only uppercase letters'
        }),
        country: Joi.string().min(2).max(100).required(),
        headquartersAddress: Joi.string().max(500).optional(),
        contactEmail: Joi.string().email().optional(),
        contactPhone: Joi.string().optional(),
        websiteUrl: Joi.string().uri().optional(),
        logoUrl: Joi.string().uri().optional(),
        description: Joi.string().max(1000).optional()
    }),

    // Flight creation validation
    flightCreation: Joi.object({
        flightNumber: Joi.string().min(2).max(20).required(),
        aircraftType: Joi.string().max(100).optional(),
        departureAirport: Joi.string().length(3).pattern(/^[A-Z]{3}$/).required().messages({
            'string.length': 'Airport code must be exactly 3 characters',
            'string.pattern.base': 'Airport code must contain only uppercase letters'
        }),
        arrivalAirport: Joi.string().length(3).pattern(/^[A-Z]{3}$/).required().messages({
            'string.length': 'Airport code must be exactly 3 characters',
            'string.pattern.base': 'Airport code must contain only uppercase letters'
        }),
        departureDate: Joi.date().min('now').required(),
        departureTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
            'string.pattern.base': 'Departure time must be in HH:MM format'
        }),
        arrivalDate: Joi.date().min(Joi.ref('departureDate')).required(),
        arrivalTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        totalSeats: Joi.number().integer().min(1).max(1000).required(),
        economySeats: Joi.number().integer().min(0).optional(),
        businessSeats: Joi.number().integer().min(0).optional(),
        firstClassSeats: Joi.number().integer().min(0).optional(),
        economyPrice: Joi.number().positive().optional(),
        businessPrice: Joi.number().positive().optional(),
        firstClassPrice: Joi.number().positive().optional(),
        baggageAllowance: Joi.number().integer().min(0).max(100).optional(),
        gate: Joi.string().max(10).optional(),
        terminal: Joi.string().max(10).optional()
    }),

    // Booking creation validation
    bookingCreation: Joi.object({
        flightId: Joi.string().uuid().required(),
        seatClass: Joi.string().valid('economy', 'business', 'first_class').required(),
        numberOfPassengers: Joi.number().integer().min(1).max(10).required(),
        passengers: Joi.array().items(
            Joi.object({
                firstName: Joi.string().min(2).max(50).required(),
                lastName: Joi.string().min(2).max(50).required(),
                dateOfBirth: Joi.date().max('now').optional(),
                gender: Joi.string().valid('male', 'female', 'other').optional(),
                passportNumber: Joi.string().max(20).optional(),
                nationality: Joi.string().max(50).optional(),
                mealPreference: Joi.string().max(50).optional()
            })
        ).required(),
        specialRequests: Joi.string().max(500).optional(),
        paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'bank_transfer').optional()
    }),

    // Flight search validation
    flightSearch: Joi.object({
        from: Joi.string().length(3).pattern(/^[A-Z]{3}$/).required(),
        to: Joi.string().length(3).pattern(/^[A-Z]{3}$/).required(),
        departureDate: Joi.date().min('now').required(),
        returnDate: Joi.date().min(Joi.ref('departureDate')).optional(),
        passengers: Joi.number().integer().min(1).max(10).optional(),
        seatClass: Joi.string().valid('economy', 'business', 'first_class').optional()
    }),

    // Flight status update validation
    flightStatusUpdate: Joi.object({
        status: Joi.string().valid('scheduled', 'boarding', 'departed', 'in-flight', 'landed', 'cancelled', 'delayed').required(),
        delayReason: Joi.string().max(200).when('status', {
            is: 'delayed',
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        actualDepartureTime: Joi.date().optional(),
        actualArrivalTime: Joi.date().optional()
    })
};

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

// Query parameter validation middleware
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Query validation failed',
                errors
            });
        }

        req.query = value;
        next();
    };
};

module.exports = {
    schemas,
    validate,
    validateQuery
};