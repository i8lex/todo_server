import { User } from "./register.mjs";
import * as dotenv from "dotenv";
import { transporter } from "../../config/index.mjs";
import * as jwt from "jsonwebtoken";
import Handlebars from "handlebars";

dotenv.config();

const { sign } = jwt.default;

export const repeatConfirmEmailHandler = async (request, reply) => {
  const { email } = request.body;

  const token = await sign({ email }, process.env.SECRET_WORD, {
    expiresIn: "15m",
  });

  const source = `<a href="{{url}}">Click to confirm</a>`;
  const template = Handlebars.compile(source);

  try {
    const data = { url: `${process.env.URL}/email/?confirm=${token}` };
    const html = template(data);

    await transporter.sendMail({
      from: "noreply-authtodomail@gmail.com",
      to: email,
      subject: "Todo registration",
      html: html,
    });
  } catch (err) {
    reply.send({ error: err.message });
  }
  try {
    const updateStatus = await User.updateOne(
      { email: email },
      { confirmationCode: token }
    );

    if (updateStatus.nModified === 0) {
      return reply.status(404).send("User not found");
    }
  } catch (err) {
    reply.status(500).send(err);
  }
  reply.send({
    message: "Successfully send",
    email,
  });
};
