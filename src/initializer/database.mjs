import mongoose from "mongoose";

const uri = 'mongodb+srv://cyberZup:Pass0011Aa@todo.zeqogjy.mongodb.net/todo?retryWrites=true&w=majority';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

export default db;
