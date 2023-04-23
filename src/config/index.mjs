import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "authtodomail@gmail.com",
    pass: process.env.GOOGLE_CONNECT,
  },
});
