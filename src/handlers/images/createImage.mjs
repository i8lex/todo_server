import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { User } from "../auth/register.mjs";
import {Task} from "../task/task.mjs";

dotenv.config();

const imageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  task: String,
  filename: String,
  mimetype: String,
  size: Number,
  path: String,
  file: Object,
  created_at: { type: Date, default: Date.now },
});

export let Image;
try {
  Image = mongoose.model("Image");
} catch (error) {
  Image = mongoose.model("Image", imageSchema);
}

/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const imageHandler = async (request, reply) => {
  const { verify } = jwt.default;
  const authHeader = request.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  const { id, email } = await verify(token, process.env.SECRET_WORD);
  const { files, task } = await request.body;

  const userFolder = `./uploads/${id}/`;
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder, { recursive: true });
  }
  let { images } = await Task.findOne({ _id: task })

  files.map((file) => {
    const mimetype = file.mimetype.replace(/^.+\//, ".");
    const saveTo = path.join(userFolder, `${email}_${uuidv4()}${mimetype}`);

    const Image = mongoose.model("Image", imageSchema);
    fs.writeFileSync(saveTo, file.data);
    const image = new Image({
      user: id,
      task: task,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.data.length,
      file: file,
      path: saveTo,
    });
    image.save();
    images.push(image._id);
  });


  console.log(task)
  console.log(images)
  await Task.updateOne(
      {  _id: task },
      { $set: {images: images} }
  );
};
