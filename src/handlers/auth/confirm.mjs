import { User } from "./register.mjs";
import * as dotenv from "dotenv";
// import { SECRET_WORD } from "../../config/index.mjs";
import * as jwt from "jsonwebtoken";

dotenv.config();

const { verify } = jwt.default;

export const confirmEmailHandler = async (request, reply) => {
  try {
    const { confirm } = request.query;
    const { email } = await verify(confirm, process.env.SECRET_WORD);
    console.log(email);
    const updateStatus = await User.updateOne(
      { email: email },
      { isconfirmed: true }
    );
    if (updateStatus.nModified === 0) {
      return reply.status(404).send("User not found");
    } else {
      reply.send({
        message: "Successfully confirmed",
        email,
      });
    }
  } catch (error) {
    reply.status(401).send(error);
  }
};
