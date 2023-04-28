// import * as jwt from "jsonwebtoken";
// import * as dotenv from "dotenv";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";
// import path from "path";
// import sharp from "sharp";
// import mongoose from "mongoose";
// import { User } from "../auth/register.mjs";
// import { Task } from "../task/task.mjs";
//
// dotenv.config();
//
// const imageSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   task: String,
//   filename: String,
//   mimetype: String,
//   size: Number,
//   path: String,
//   image: Object,
//   thumb: Object,
//   thumbMimetype: String,
//   thumbSize: Number,
//   thumbPath: String,
//   created_at: { type: Date, default: Date.now },
// });
//
// export let Image;
// try {
//   Image = mongoose.model("Image");
// } catch (error) {
//   Image = mongoose.model("Image", imageSchema);
// }
//
// /**
//  * @param {FastifyRequest} request
//  * @param {FastifyReply} reply
//  * @return {Promise<void>}
//  */
// export const imageHandler = async (request, reply) => {
//   const { verify } = jwt.default;
//   const authHeader = request.headers.authorization;
//   const token = authHeader ? authHeader.split(" ")[1] : null;
//   const { id, email } = await verify(token, process.env.SECRET_WORD);
//   const { files, task } = await request.body;
//
//   const imagePath = `./uploads/${id}/orig/`;
//   if (!fs.existsSync(imagePath)) {
//     fs.mkdirSync(imagePath, { recursive: true });
//   }
//   const thumbPath = `./uploads/${id}/thumb/`;
//   if (!fs.existsSync(thumbPath)) {
//     fs.mkdirSync(thumbPath, { recursive: true });
//   }
//
//
//   let { images } = await Task.findOne({ _id: task })
//
//    files.map((image) => {
//     const mimetype = image.mimetype.replace(/^.+\//, ".");
//     const saveTo = path.join(imagePath, `${email}_${uuidv4()}${mimetype}`);
//
//     const Image = mongoose.model("Image", imageSchema);
//     fs.writeFileSync(saveTo, image.data);
//
//     const thumbBuffer = sharp(image.data)
//         .resize(200, 200, { fit: "cover" })
//         .toBuffer();
//
//     const thumbMimetype = mimetype;
//     const thumbSaveTo = path.join(imagePath, `${email}_${uuidv4()}_thumb${thumbMimetype}`);
//
//     fs.writeFileSync(thumbSaveTo, thumbBuffer.data);
//
//
//     const addImage = new Image({
//       user: id,
//       task: task,
//       filename: image.filename,
//       mimetype: image.mimetype,
//       size: image.data.length,
//       image: image,
//       thumb: thumbBuffer,
//       thumbMimetype: thumbMimetype,
//       thumbSize: thumbBuffer.length,
//       thumbPath: thumbSaveTo,
//       path: saveTo,
//     });
//     addImage.save();
//     images.push(addImage._id);
//   });
//
//
//   console.log(task)
//   console.log(images)
//   await Task.updateOne(
//       {  _id: task },
//       { $set: {images: images} }
//   );
// };


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
  task: String,
  filename: String,
  mimetype: String,
  size: Number,
  path: String,
  image: Object,
  thumb: Object,
  thumbMimetype: String,
  thumbSize: Number,
  thumbPath: String,
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
    const saveTo = path.join(imagePath, `${email}_${uuidv4()}${mimetype}`);

    const Image = mongoose.model("Image", imageSchema);
    fs.writeFileSync(saveTo, image.data);

    const thumbBuffer = await sharp(image.data)
        .resize(200, 200, { fit: "cover" })
        .toBuffer();

    const thumbMimetype = mimetype;
    const thumbSaveTo = path.join(thumbPath, `${email}_${uuidv4()}_thumb${thumbMimetype}`);

    fs.writeFileSync(thumbSaveTo, thumbBuffer);

    const addImage = new Image({
      user: id,
      task: task,
      filename: image.filename,
      mimetype: image.mimetype,
      size: image.data.length,
      image: image,
      thumb: thumbBuffer,
      thumbMimetype: thumbMimetype,
      thumbSize: thumbBuffer.length,
      thumbPath: thumbSaveTo,
      path: saveTo,
    });

    await addImage.save();
    images.push(addImage._id);
  }

  await Task.updateOne({ _id: task }, { $set: { images: images } });

  reply.send({ message: "Images uploaded successfully" });
};
