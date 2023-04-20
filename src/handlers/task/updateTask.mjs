import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
// import {SECRET_WORD} from "../../config/index.mjs";
import { Task } from "./task.mjs"

dotenv.config();

const { verify } = jwt.default;


/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const updateTaskHandler = async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;
    const { id } = await verify(token, process.env.SECRET_WORD);
    console.log(id)
    const { id: tokenId } = request.params;
    const updates = request.body;
    console.log(tokenId)
    try {
        const updatedTask = await Task.updateOne({ _id: tokenId, user: id }, { $set:updates });

        if (updatedTask.nModified === 0) {
            return reply.status(404).send('Task not found');
        }

        reply.send(updatedTask);
    } catch (err) {
        reply.status(500).send(err);
    }
}
