import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
import { Task } from "./task.mjs";

dotenv.config();

const { verify } = jwt.default;

/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const getTaskHandler = async (request, reply) => {
  const authHeader = request.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  const { id } = await verify(token, process.env.SECRET_WORD);
  const { query } = request;

  try {
    let tasks;
    if (Object.keys(query).length === 0) {
      tasks = await Task.find({ user: id });
    } else {
      tasks = await Task.find({ ...query, user: id });
    }

    reply.send(tasks);
  } catch (err) {
    reply.status(500).send(err);
  }
};
