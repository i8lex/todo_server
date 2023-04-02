import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from "./register.mjs";
import { SECRET_WORD } from "../config/index.mjs";

const { sign } = jwt.default;

/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const loginHandler = async (request, reply) => {
    const { email, password } = request.body;

    const user = await User.findOne({ email });

    if(user) {
        const isPasswordCorrect = await compare(password, user.password);
        if(isPasswordCorrect) {
            console.log(sign)
            const token = await sign({ email: user.email, id: user.id }, SECRET_WORD, {
                expiresIn: '1h',
            });
            return reply.send({ message: `Welcome ${user.name}`, token})
                .setCookie('token', token, { httpOnly: true });
        }}
    return reply.send({ message: 'Wrong email or password' });

};

// export const loginConfig = [
//     Routes.login,
//     {
//         schema: {
//             tags: ['Auth'],
//             description: 'Logging user',
//             get summary() {
//                 return this.description;
//             },
//             body: {
//                 type: 'object',
//                 properties: {
//                     email: {
//                         description: 'Email of user',
//                         type: 'string',
//                         minLength: 6,
//                         maxLength: 50,
//                     },
//                     password: {
//                         description: 'Password of user',
//                         type: 'string',
//                         minLength: 8,
//                         maxLength: 50,
//                     },
//                 },
//                 required: ['email', 'password'],
//             },
//             response: {
//                 200: {
//                     description: 'Successful logged in account',
//                     type: 'object',
//                     required: ['token', 'email'],
//                     properties: {
//                         token: {
//                             type: 'string',
//                             // default:
//                             //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
//                         },
//                         email: {
//                             type: 'string',
//                             default: 'test@test.com',
//                         },
//                         // role: {
//                         //     type: 'string',
//                         //     default: 'ADMIN',
//                         //     description: 'Type can be admin or user',
//                         // },
//                     },
//                 },
//                 400: {
//                     description: 'If you try login to not existed user',
//                     type: 'object',
//                     properties: {
//                         message: { type: 'string', default: 'User does not exit' },
//                         field: { type: 'string', default: 'email' },
//                     },
//                 },
//                 403: {
//                     description: 'If you try login with invalid password',
//                     type: 'object',
//                     properties: {
//                         message: {
//                             type: 'string',
//                             default: 'Your password in incorrect',
//                         },
//                         field: { type: 'string', default: 'password' },
//                     },
//                 },
//             },
//         },
//     },
//     loginHandler,
// ];