import * as jwt from 'jsonwebtoken';
import {SECRET_WORD} from "../../config/index.mjs";
import { Image } from "./createImage.mjs"

const { verify } = jwt.default;


/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const deleteImageHandler = async (request, reply) => {
    const { token } = request.headers;
    const { userId } = await verify(token, SECRET_WORD);
    const { ids } = request.query;
    console.log(ids)

    try {
        if (Object.keys(ids.split(',')).length === 0) {
            const images = await Image.find({ user: userId });
            reply.send(images);
        }

        const deletedImages = await Image.deleteMany({ _id: { $in: ids.split(',') } });
        if (deletedImages.deletedCount === 0) {
            return reply.status(404).send('Images not found');
        }

        reply.send(deletedImages);
    } catch (err) {
        reply.status(500).send(err);
    }
}
