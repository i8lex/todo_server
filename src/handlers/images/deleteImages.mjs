import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
import { Image } from "./createImage.mjs";

dotenv.config();

const { verify } = jwt.default;

/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const deleteImageHandler = async (request, reply) => {
  const authHeader = request.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  const { userId } = await verify(token, process.env.SECRET_WORD);
  const { ids } = request.query;
  console.log(ids);

  try {
    if (Object.keys(ids.split(",")).length === 0) {
      const images = await Image.find({ user: userId });
      reply.send(images);
    }

    const deletedImages = await Image.deleteMany({
      _id: { $in: ids.split(",") },
    });
    if (deletedImages.deletedCount === 0) {
      return reply.status(404).send("Images not found");
    }

    reply.send(deletedImages);
  } catch (err) {
    reply.status(500).send(err);
  }
};
