import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";
import fastifyCsrf from "@fastify/csrf-protection";
import fastifyFormBody from "@fastify/formbody";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { auth } from "./hooks/auth.mjs";
import { ROUTE_PREFIX, Routes } from "./constants/routes.mjs";
import { registerHandler } from "./handlers/auth/register.mjs";
import { confirmEmailHandler } from "./handlers/auth/confirm.mjs";
import { repeatConfirmEmailHandler } from "./handlers/auth/repeatConfirm.mjs";
import { loginHandler } from "./handlers/auth/login.mjs";
import { imageHandler } from "./handlers/images/createImage.mjs";
import { getImageHandler } from "./handlers/images/getImage.mjs";
import { deleteImageHandler } from "./handlers/images/deleteImages.mjs";
import { taskHandler } from "./handlers/task/task.mjs";
import { getTaskHandler } from "./handlers/task/getTask.mjs";
import { updateTaskHandler } from "./handlers/task/updateTask.mjs";
import { deleteTaskHandler } from "./handlers/task/deleteTask.mjs";
import { getThumbsHandler } from "./handlers/images/getThumbs.mjs";

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
  uploadDir: "/tmp",
});
server.register(fastifyCookie);
server.register(fastifyCsrf);
server.register(fastifyFormBody);
server.register(fastifySwagger);
server.register(fastifySwaggerUi, { swaggerUrl: "/documentation/json" });

server.register(
  (instance, opts, done) => {
    instance.addHook("preHandler", auth);

    instance.post(Routes.register, registerHandler);
    instance.post(Routes.login, loginHandler);
    instance.get(Routes.email, confirmEmailHandler);
    instance.put(Routes.emailRepeat, repeatConfirmEmailHandler);

    instance.post(Routes.createImage, imageHandler);
    instance.get(Routes.image, getImageHandler);
    instance.get(Routes.images, getThumbsHandler);

    instance.delete(Routes.image, deleteImageHandler);
    instance.post(Routes.task, taskHandler);
    instance.get(Routes.task, getTaskHandler);
    instance.put(Routes.changeTask, updateTaskHandler);
    instance.delete(Routes.changeTask, deleteTaskHandler);

    // instance.post(...registerConfig);
    // instance.post(...loginConfig);

    done();
  },
  {
    prefix: ROUTE_PREFIX,
  }
);

export default server;
