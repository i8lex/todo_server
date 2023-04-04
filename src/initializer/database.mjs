import mongoose from "mongoose";
import * as dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_CONNECT;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

export default db;
