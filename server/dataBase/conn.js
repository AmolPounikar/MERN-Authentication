import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server'

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

async function connect() {
    const mongod = await MongoMemoryServer.create()
    const getUri = mongod.getUri()

    mongoose.set('strictQuery', true)
    const db = await mongoose.connect(process.env.ATLAS_URI)
    console.log('Database is connected')
    return db
}

export default connect;
