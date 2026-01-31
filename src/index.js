import mongoose from "mongoose";
// import {DB_NAME} from 'constants.js'
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
    path : './env'
})


connectDB();






