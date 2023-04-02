import * as fs from "fs";
import * as jwt from 'jsonwebtoken';
import { SECRET_WORD } from "../config/index.mjs";
const { verify } = jwt.default;


export const imageHandler = async (request, reply) => {
    const { token } = request.headers;
    const payload = await verify(token, SECRET_WORD);

    console.log(payload.id)

    return reply.send({ message: 'upload' });

};
