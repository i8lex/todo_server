import server from "./server.mjs";
import db from "./initializer/database.mjs";
import * as dotenv from "dotenv";

dotenv.config();

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  server.listen(
    {
      port: process.env.PORT || 3001,
      host: "0.0.0.0",
    },
    () => {
      console.log(`Server is running`);
    }
  );
  console.log("Connected to MongoDB!");
});
