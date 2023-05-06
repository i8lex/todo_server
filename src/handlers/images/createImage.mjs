import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import mongoose from "mongoose";
import { User } from "../auth/register.mjs";
import { Task } from "../task/task.mjs";

dotenv.config();

const imageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  thumb: { type: mongoose.Schema.Types.ObjectId, ref: "Thumb" },
  filename: String,
  mimetype: String,
  size: Number,
  path: String,
  image: Object,
  thumbMimetype: String,
  thumbSize: Number,
  thumbPath: String,
  created_at: { type: Date, default: Date.now },
});

const thumbSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
  filename: String,
  mimetype: String,
  thumb: Object,
  thumbSize: Number,
  thumbPath: String,
  created_at: { type: Date, default: Date.now },
});

export let Image;
export let Thumb;

try {
  Image = mongoose.model("Image");
  Thumb = mongoose.model("Thumb");
} catch (error) {
  Image = mongoose.model("Image", imageSchema);
  Thumb = mongoose.model("Thumb", thumbSchema);
}

/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @return {Promise<void>}
 */
export const imageHandler = async (request, reply) => {
  try {
    const { verify } = jwt.default;
    const authHeader = request.headers.authorization;
    const token = authHeader ? authHeader.split(" ")[1] : null;
    const { id, email } = await verify(token, process.env.SECRET_WORD);
    const { images: files, task } = await request.body;
    console.log(files);
    const imagePath = `./uploads/${id}/orig/`;
    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath, { recursive: true });
    }
    const thumbPath = `./uploads/${id}/thumb/`;
    if (!fs.existsSync(thumbPath)) {
      fs.mkdirSync(thumbPath, { recursive: true });
    }

    let { images } = await Task.findOne({ _id: task });

    for (const image of files) {
      const mimetype = image.mimetype.replace(/^.+\//, ".");
      const imageSaveTo = path.join(
        imagePath,
        `${email}_${uuidv4()}${mimetype}`
      );
      const thumbSaveTo = path.join(
        thumbPath,
        `${email}_${uuidv4()}_thumb${mimetype}`
      );

      const Image = mongoose.model("Image", imageSchema);
      const Thumb = mongoose.model("Thumb", thumbSchema);

      const thumbBuffer = await sharp(image.data)
        .resize(100, 100, { fit: "cover" })
        .toBuffer();

      fs.writeFileSync(imageSaveTo, image.data);
      fs.writeFileSync(thumbSaveTo, thumbBuffer);

      const addImage = new Image({
        user: id,
        task: task,
        filename: image.filename,
        mimetype: image.mimetype,
        size: image.data.length,
        image: image.data,
        path: imageSaveTo,
      });

      const addThumb = new Thumb({
        user: id,
        task: task,
        image: addImage._id,
        filename: image.filename,
        size: thumbBuffer.length,
        thumb: thumbBuffer,
        mimetype: image.mimetype,
        thumbPath: thumbSaveTo,
      });

      await addImage.save();
      await addThumb.save();

      await Image.updateOne(
        { _id: addImage._id },
        { $set: { thumb: addThumb._id } }
      );

      images.push(`localhost:3001/api/image/${addThumb._id}`);
    }

    await Task.updateOne({ _id: task }, { $set: { images: images } });

    reply.send({ message: "Images uploaded successfully" });
  } catch (error) {
    reply.send({ message: "Upload error" });
  }
};
