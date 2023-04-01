// Импортируем модули
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyFormBody from '@fastify/formbody';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { MongoClient } from 'mongodb';
import mongoose from "mongoose";
import {hash, compare} from 'bcrypt';
import jwt from 'jsonwebtoken';

// const client = new MongoClient('mongodb+srv://cyberZup:Pass0011Aa@todo.zeqogjy.mongodb.net/?retryWrites=true&w=majority');
await client.connect();

const db = client.db('mydb');
const users = db.collection('users');

const server = fastify();

server.register(fastifyCors);
server.register(fastifyMultipart);
server.register(fastifyCookie);
server.register(fastifyCsrf);
server.register(fastifyFormBody);
server.register(fastifySwagger);
server.register(fastifySwaggerUi, { swaggerUrl: '/documentation/json' });

server.post('/register', async (req, res) => {

    const { name, email, password } = req.body;
    const existingEmail = await users.findOne({ email });
    const existingName = await users.findOne({ name });
    const passwordHash = await hash(password, 10);
    const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });

    if (existingEmail) {
       return res.code(409).send({ message: 'This email already exists' });
    } else if (existingName) {
        return res.code(409).send({ message: 'This name already exists' });
    } else {
        await users.insertOne({ name, email, password: passwordHash })
        return res.send({ success: true, message: 'User registered' })
                .setCookie('token', token, { httpOnly: true })
    }

});

server.post('/login', async (req, res) => {

    const { email, password } = req.body;

    const user = await users.findOne({ email });

    if(user) {
        const isPasswordCorrect = await compare(password, user.password);
        if(isPasswordCorrect) {
            const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
            return res.send({ message: `Welcome ${user.name}`})
                .setCookie('token', token, { httpOnly: true });
    }}
    return res.send({ message: 'Wrong email or password' });

});

server.listen({
    port: 3001,
    host: 'localhost'
}, () => {
    console.log('Server is running');
});

