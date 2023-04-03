import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyFormBody from '@fastify/formbody';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { registerHandler } from './handlers/register.mjs'
import { auth } from "./hooks/auth.mjs";
import { ROUTE_PREFIX, Routes } from "./constants/routes.mjs";
import { loginHandler } from "./handlers/login.mjs";
import {imageHandler} from "./handlers/image.mjs";

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
    attachFieldsToBody: true,
    limits: { fileSize: 4 * 1024 * 1024 },
    uploadDir: '/tmp',
});
server.register(fastifyCookie);
server.register(fastifyCsrf);
server.register(fastifyFormBody);
server.register(fastifySwagger);
server.register(fastifySwaggerUi, { swaggerUrl: '/documentation/json' });

server.register(
    (instance, opts, done) => {
        instance.addHook('preHandler', auth);

        instance.post(Routes.register, registerHandler);
        instance.post(Routes.login, loginHandler);

        instance.post('/image', imageHandler);
        // instance.post(...registerConfig);
        // instance.post(...loginConfig);

        done();
    },
    {
        prefix: ROUTE_PREFIX,
    }
);

export default server
