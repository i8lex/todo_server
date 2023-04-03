import * as jwt from 'jsonwebtoken';
import fs from 'fs';
import {SECRET_WORD} from "../../config/index.mjs";
import { Image } from "./createImage.mjs"
const { verify } = jwt.default;

export const getImageHandler = async (request, reply) => {
    const { token } = request.headers;
    const { id } = await verify(token, SECRET_WORD);
    const { id: imageId } = request.params;
    console.log(imageId)
    try {
        const image = await Image.findOne({_id: imageId, user: id});
        console.log(image.mimetype)
        console.log(image.path)
        if (!image) {
            return reply.code(404).send({ message: 'Image not found' });
        }

        const data = fs.readFileSync(image.path);
        reply.type(image.mimetype).send(data);

    } catch (err) {
        console.log(err)
        reply.code(500).send({ message: 'Server error' });
    }
};
