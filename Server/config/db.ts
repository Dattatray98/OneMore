import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) {
            console.error('MONGO_URI is not defined in .env');
            if (process.env.NODE_ENV === 'production') {
                process.exit(1);
            }
        }

        await mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/onemore');
        console.log(`Connected to MongoDB ${process.env.NODE_ENV === 'production' ? '(Production)' : '(Development)'}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;
