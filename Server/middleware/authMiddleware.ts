import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            // Extract payload from JWT (Token structure: header.payload.signature)
            const parts = token.split('.');
            if (parts.length === 3) {
                const payloadBase64 = parts[1];

                if (payloadBase64) {
                    // Handle Base64Url characters
                    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
                    const decodedJson = Buffer.from(base64, 'base64').toString();
                    const decoded = JSON.parse(decodedJson);

                    // Attach userId to request object
                    // Assuming 'sub' contains the userId in the JWT claims
                    if (decoded.sub) {
                        (req as any).userId = decoded.sub;
                    }
                }
            }
        }
        next();
    } catch (error) {
        next(); // Proceed without user ID if extraction fails
    }
};
