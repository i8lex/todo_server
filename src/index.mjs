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
import {hash, compare} from 'bcrypt';
import jwt from 'jsonwebtoken';

// Подключаемся к MongoDB
const client = new MongoClient('mongodb+srv://cyberZup:Pass0011Aa@todo.zeqogjy.mongodb.net/?retryWrites=true&w=majority');
await client.connect();

// Создаем базу данных и коллекцию
const db = client.db('mydb');
const users = db.collection('users');

// Создаем Fastify сервер
const server = fastify();

// Подключаем необходимые плагины
server.register(fastifyCors);
server.register(fastifyMultipart);
server.register(fastifyCookie);
server.register(fastifyCsrf);
server.register(fastifyFormBody);
server.register(fastifySwagger);
server.register(fastifySwaggerUi, { swaggerUrl: '/documentation/json' });
// Определяем роут для регистрации пользователей
server.post('/register', async (req, res) => {
    // Извлекаем данные из тела запроса
    const { name, email, password } = req.body;

    const existingEmail = await users.findOne({ email });
    const existingName = await users.findOne({ name });

    if (existingEmail) {
        res.code(409).send({ message: 'This email already exists' });
        return;
    }else if (existingName) {
        res.code(409).send({ message: 'This name already exists' });
        return;
    }

    // Хешируем пароль
    const passwordHash = await hash(password, 10);
    // const hashedPassword = await hash(password);
    const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });


    // Добавляем пользователя в базу данных
    await users.insertOne({ name, email, password: passwordHash });

    // Отправляем ответ
    res.setCookie('token', token, { httpOnly: true });
    res.send({ success: true, message: 'User registered' });

});

// Определяем роут для проверки пароля
server.post('/login', async (req, res) => {
    // Извлекаем данные из тела запроса
    const { email, password } = req.body;

    // Ищем пользователя в базе данных
    const user = await users.findOne({ email });

    if(!user) {
        return res.send({ message: 'User not exist' });
    }
    console.log(user)

    // Проверяем пароль
    const isPasswordCorrect = await compare(user.password, password);

    // Генерируем JWT токен
    const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });

    // Отправляем ответ
    if(isPasswordCorrect) {
        return res.send({ message: 'Logged in', token });
    } else return res.send({ message: 'Wrong password' });

});

// Запускаем сервер
server.listen({
    port: 3001,
    host: 'localhost'
}, () => {
    console.log('Server is running');
});