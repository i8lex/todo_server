import { hash } from 'bcrypt';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer'
import Handlebars from 'handlebars';
import * as jwt from 'jsonwebtoken';
// import { SECRET_WORD } from "../../config/index.mjs";

dotenv.config();

const { sign } = jwt.default;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [4, 'Username must be at least 4 characters long'],
        maxlength: [20, 'Username must be at max 20 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'Invalid email format',
        ],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
            'Password must contain at least one lowercase letter, one uppercase letter and one number',
        ],
    },
    confirmationCode: {
        type: String,
        required: true,
        unique: true,
    },
    isconfirmed: {
        type: Boolean,
        default: false,
    },
    created: {  type: Date, default: Date.now },
});

export const User = mongoose.model('User', UserSchema);

/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const registerHandler = async (request, reply) => {
    const { name, email, password } = request.body;
    const existingEmail = await User.findOne({ email });
    const existingName = await User.findOne({ name });

    if (existingName) {
        return reply.status(400).send({
            message: 'User with this name already exists',
            field: 'name',
        });
    }
    if (existingEmail) {
        return reply.status(400).send({
            message: 'User with this email already exists',
            field: 'email',
        });
    }
    if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.test(password)) {
        return reply.status(400).send({
            message: 'Password must contain at least one lowercase letter, one uppercase letter, one number and must be at least 8 characters long',
            field: 'password',
        });
    }

    const hashedPassword = await hash(password, 10);
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'authtodomail@gmail.com',
            pass: process.env.GOOGLE_CONNECT
        }
    });

    const token = await sign({ email }, process.env.SECRET_WORD, {
        expiresIn: '15m',
    });

    const source = `<a href="{{url}}">Click to confirm</a>`;
    const template = Handlebars.compile(source);

    try {
        // Заполняем шаблон данными
        const data = { url: `http://localhost:3001/api/email/?confirm=${token}` };
        const html = template(data);

        // Отправляем письмо
        await transporter.sendMail({
            from: 'noreply-authtodomail@gmail.com',
            to: email,
            subject: 'Todo registration',
            html: html // Используем скомпилированный HTML-код
        });

    } catch (err) {
        reply.send({ error: err.message });
    }

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        confirmationCode: token,
    });





await newUser.save();
    return reply.status(201).send({ message: 'User successful created' });

};


// export const registerConfig = [
//     Routes.register,
//     {
//         schema: {
//             tags: ['Auth'],
//             description: 'Creating account of user',
//             get summary() {
//                 return this.description;
//             },
//             body: {
//                 type: 'object',
//                 properties: {
//                     name: {
//                         type: 'string',
//                         description: 'Name of user',
//                         minLength: 4,
//                         maxLength: 40,
//                     },
//                     email: {
//                         type: 'string',
//                         description: 'Email of user',
//                         minLength: 6,
//                         maxLength: 50,
//                         format: 'email',
//                     },
//                     password: {
//                         description: 'Password of user',
//                         type: 'string',
//                         minLength: 8,
//                         maxLength: 50,
//                         pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]+$',
//                     },
//                 },
//                 required: ['email', 'password', 'name'],
//             },
//             response: {
//                 201: {
//                     type: 'object',
//                     description: 'Successful registered user',
//                     properties: {
//                         message: {
//                             type: 'string',
//                             default: 'User successful created',
//                         },
//                     },
//                     required: ['message'],
//                 },
//                 400: {
//                     type: 'object',
//                     properties: {
//                         message: {
//                             type: 'string',
//                             default: 'Error when user already exists',
//                         },
//                         field: {
//                             type: 'string',
//                             default: 'email',
//                         },
//                     },
//                     required: ['message', 'field'],
//                     description: 'Error when user already exists',
//                 },
//             },
//         },
//     },
//     registerHandler,
// ];
