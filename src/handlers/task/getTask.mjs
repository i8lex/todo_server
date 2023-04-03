import * as jwt from 'jsonwebtoken';
import {SECRET_WORD} from "../../config/index.mjs";
import { Task } from "./task.mjs"

const { verify } = jwt.default;

/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const getTaskHandler = async (request, reply) => {
    const { token } = request.headers;
    const { id } = await verify(token, SECRET_WORD);
    const { query } = request;
    console.log(!Object.keys(query))

    try {
        let tasks;
        if (Object.keys(query).length === 0) {
            tasks = await Task.find({ user: id });
        } else {
            console.log(query)
            tasks = await Task.find({ ...query, user: id});
        }

        reply.send(tasks);
    } catch (err) {
        reply.status(500).send(err);
    }
}
