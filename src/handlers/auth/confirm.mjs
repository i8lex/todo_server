import { User } from "./register.mjs";
import * as dotenv from 'dotenv';
// import { SECRET_WORD } from "../../config/index.mjs";
import * as jwt from "jsonwebtoken";

dotenv.config();

const { verify } = jwt.default;

export const confirmEmailHandler = async (request, reply) => {

    const { confirm } = request.query
    const { email } = await verify(confirm, process.env.SECRET_WORD);

    try {
        const updateStatus = await User.updateOne({ email:email }, { isconfirmed: true });

        if (updateStatus.nModified === 0) {
            return reply.status(404).send('User not found');
        }

    } catch (err) {
        reply.status(500).send(err);
    }
        reply.send({
                message: 'Successfully confirmed', email
        })
}

