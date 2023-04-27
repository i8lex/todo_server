import * as dotenv from "dotenv";
import mongoose from "mongoose";
import * as jwt from "jsonwebtoken";
import { User } from "../auth/register.mjs";

dotenv.config();

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: {
    type: String,
    required: [true, "Name is required"],
    minlength: [4, "Username must be at least 4 characters long"],
    maxlength: [20, "Username must be at max 20 characters long"],
  },
  description: {
    type: String,
    maxlength: [500, "Task description must be at max 500 characters long"],
  },
  done: {
    type: Boolean,
    default: false,
  },
  created: { type: Date, default: Date.now },
  deadline: { type: Date },
});

export const Task = mongoose.model("Task", TaskSchema);
const { verify } = jwt.default;

/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const taskHandler = async (request, reply) => {
  const { title, description, deadline, done } = request.body;
  const authHeader = request.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  const { id } = await verify(token, process.env.SECRET_WORD);

  const newTask = new Task({
    user: id,
    title: title,
    done: done,
    description: description,
    deadline: deadline,
  });

  try {
    await newTask.save();
  } catch (err) {
    console.log(err);
  }

  return reply
    .status(200)
    .send({ message: "Task successful created", newTask });
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
