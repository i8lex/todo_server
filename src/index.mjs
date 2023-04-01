import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyFormBody from '@fastify/formbody';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
// import { MongoClient } from 'mongodb';
import mongoose from "mongoose";
import {hash, compare} from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerConfig, User, UserSchema, registerHandler } from './handlers/register.mjs'
import {auth} from "./hooks/auth.mjs";
import {ROUTE_PREFIX} from "./constants/routes.mjs";


mongoose.connect('mongodb+srv://cyberZup:Pass0011Aa@todo.zeqogjy.mongodb.net/todo?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to mongoDB!'));

// const UserSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Username is required'],
//         unique: true,
//         minlength: [4, 'Username must be at least 4 characters long'],
//         maxlength: [20, 'Username must be at max 20 characters long'],
//     },
//     email: { type: String,
//         required: [true, 'Email is required'],
//         unique: true,
//         lowercase: true,
//         match: [
//             /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
//             'Invalid email format',
//         ],
//     },
//     password: {
//         type: String,
//         required: [true, 'Password is required'],
//         minlength: [8, 'Password must be at least 8 characters long'],
//         match: [
//             /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
//             'Password must contain at least one lowercase letter, one uppercase letter and one number',
//         ],
//     }});

// const UserModel = mongoose.model('User', UserSchema);


const server = fastify({
    logger: true,
    ajv: {
        customOptions: {
            allErrors: true,
        },
    },
});

server.register(fastifyCors);
server.register(fastifyMultipart, {
    addToBody: true,
});
server.register(fastifyCookie);
server.register(fastifyCsrf);
server.register(fastifyFormBody);
server.register(fastifySwagger);
server.register(fastifySwaggerUi, { swaggerUrl: '/documentation/json' });

server.register(
    (instance, opts, done) => {
        instance.addHook('preHandler', auth);

        // instance.post('/register', registerHandler);

        instance.post(...registerConfig);

        done();
    },
    {
        prefix: ROUTE_PREFIX,
    }
);


// server.post('/register', async (req, res) => {
//
//     const { name, email, password } = req.body;
//
//     const passwordHash = await hash(password, 10);
//     const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
//     const existingEmail = await User.findOne({ email });
//     const existingName = await User.findOne({ name });
//     if (existingName) {
//         res.status(400).send({ error: 'Username already exists' });
//         return;
//     } else if (existingEmail) {
//         res.status(400).send({ error: 'Email already exists' });
//         return;
//     }
//     const newUser = new User({ name, email, password: passwordHash });
//     await newUser.save();
//     res.send({ success: 'User registered successfully' })
//         .setCookie('token', token, { httpOnly: true });
// });



server.post('/login', async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(user) {
        const isPasswordCorrect = await compare(password, user.password);
        if(isPasswordCorrect) {
            const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
            return res.send({ message: `Welcome ${user.name}`, token})
                .setCookie('token', token, { httpOnly: true });
    }}
    return res.send({ message: 'Wrong email or password' });

});

server.listen({
    port: 3001,
    host: 'localhost'
}, () => {
    console.log(`Server is running`);
});

