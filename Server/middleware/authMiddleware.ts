import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('--- Auth Middleware ---');
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth Header present:', !!authHeader);

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            console.log('Token found (length):', token.length);

            // Extract payload from JWT (Token structure: header.payload.signature)
            const parts = token.split('.');
            if (parts.length === 3) {
                const payloadBase64 = parts[1];

                if (payloadBase64) {
                    // Handle Base64Url characters
                    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
                    const decodedJson = Buffer.from(base64, 'base64').toString();
                    const decoded = JSON.parse(decodedJson);

                    console.log('Decoded Token Keys:', Object.keys(decoded));
                    console.log('Decoded sub:', decoded.sub);

                    // Attach userId to request object
                    // Assuming 'sub' contains the userId in the JWT claims
                    if (decoded.sub) {
                        (req as any).userId = decoded.sub;
                        console.log('Set req.userId to:', decoded.sub);
                    } else {
                        console.log('No sub found in token payload');
                    }
                }
            } else {
                console.log('Invalid token structure');
            }
        } else {
            console.log('No Bearer token found in header');
        }
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error);
        next(); // Proceed without user ID if extraction fails
    }
};
