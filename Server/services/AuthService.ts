import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as any;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

const secret = (JWT_SECRET || 'dev_fallback_secret_not_safe_for_prod') as string;

export class AuthService {
    static async register(email: string, pass: string) {
        const existing = await User.findOne({ email });
        if (existing) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(pass, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        return user;
    }

    static async login(email: string, pass: string) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('Invalid credentials');

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = jwt.sign({ userId: user._id, email: user.email }, secret, { expiresIn: JWT_EXPIRES_IN });
        return { user, token };
    }

    static verifyToken(token: string) {
        return jwt.verify(token, secret);
    }
}
