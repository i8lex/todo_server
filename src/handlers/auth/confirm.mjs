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
        reply.send({ message: 'Successfully confirmed', email  })

}





// const oAuth2Client = new google.auth.OAuth2(
//     '364902392539-i4jd7d1hnn0mba8563tc1u68c4ugsm08.apps.googleusercontent.com',
//     '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',
//     '["http://localhost","http://localhost:3001"]'
// );
//
// const authorizeUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: 'https://www.googleapis.com/auth/gmail.send'
// });
//
// // Обмениваем временный код на токен доступа и токен обновления
// const { tokens } = await oAuth2Client.getToken(code);
//
// // Сохраняем токены для использования в будущем
// oAuth2Client.setCredentials(tokens);
//
//
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: 'authtodomail@gmail.com',
//         clientId: '364902392539-i4jd7d1hnn0mba8563tc1u68c4ugsm08.apps.googleusercontent.com',
//         clientSecret: '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',
//         refreshToken: tokens.refresh_token,
//         accessToken: tokens.access_token,
//         expires: tokens.expiry_date
//     }
// });
//
// const confirmationCode = await sign({ email }, SECRET_WORD, {
//     expiresIn: '15m',
// });
//
// await transporter.sendMail({
//     from: 'authtodomail@gmail.com',
//     to: email,
//     subject: `For ${name} Todo confirmation`,
//     text: `Your confirmation link is http://localhost:3001/api/${confirmationCode}`,
// });
