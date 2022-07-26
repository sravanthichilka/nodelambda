import { connect } from 'mongoose';
import config from "../config/app";
import dotenv from 'dotenv'
import log from "../helper/logs";
dotenv.config();

const connectDB = async () => {
  try { 
    await connect(<string>config.MONGO_DB.DB_MONGO_DB,);
    log.info(['MongoDB Connected Successfully!']);
  } catch (error:any) {
    log.info(['Unable to connect:',error.message])
  }
}

export { connectDB }