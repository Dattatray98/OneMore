import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
const logFile = 'D:\\My_Learning\\OneMore\\Server\\server_debug.log';

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://jojewardattatray_db_user:MIFx8psdrtroevVH@cluster0.navwmzg.mongodb.net/taskdailydb';
        await mongoose.connect(MONGO_URI);
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Connected to MongoDB\n`);
        console.log('Connected to MongoDB');
    } catch (error) {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] MongoDB connection error: ${error}\n`);
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;
