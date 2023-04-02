import mongoose from "mongoose";
import server from "./server.mjs";

mongoose.connect('mongodb+srv://cyberZup:Pass0011Aa@todo.zeqogjy.mongodb.net/todo?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to mongoDB!'));

server.listen({
    port: 3001,
    host: 'localhost'
}, () => {
    console.log(`Server is running`);
});

