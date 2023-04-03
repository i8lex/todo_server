import * as jwt from 'jsonwebtoken';
import {SECRET_WORD} from "../../config/index.mjs";
import { Task } from "./task.mjs"

const { verify } = jwt.default;


/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const deleteTaskHandler = async (request, reply) => {
    const { token } = request.headers;
    const { userId } = await verify(token, SECRET_WORD);
    const { ids } = request.query;
    console.log(ids)

    try {
        if (Object.keys(ids.split(',')).length === 0) {
           const tasks = await Task.find({ user: userId });
            reply.send(tasks);
        }

        const deletedTasks = await Task.deleteMany({ _id: { $in: ids.split(',') } });
        if (deletedTasks.deletedCount === 0) {
            return reply.status(404).send('Task not found');
        }

        reply.send(deletedTasks);
    } catch (err) {
        reply.status(500).send(err);
    }
}
