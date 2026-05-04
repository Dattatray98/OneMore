import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export interface AppError extends Error {
    statusCode?: number;
    errors?: any[];
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors;

    // Handle Zod Validation Errors
    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation Failed';
        errors = err.issues;
    }

    // Handle Mongoose Validation Errors
    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = 'Database Validation Failed';
        errors = Object.values(err.errors).map(e => ({ message: e.message, path: e.path }));
    }

    // Handle Mongoose Duplicate Key Errors
    if ((err as any).code === 11000) {
        statusCode = 409;
        message = 'Duplicate entry detected';
    }

    console.error(`[Error] ${req.method} ${req.url} - ${message}`);
    if (err.stack && process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message,
        statusCode,
        errors
    });
};

export class CustomError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}
