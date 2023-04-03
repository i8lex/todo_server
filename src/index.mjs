import server from "./server.mjs";
import db from "./initializer/database.mjs"


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    server.listen({
        port: 3001,
        host: 'localhost'
    }, () => {
        console.log(`Server is running`);
    });
    console.log('Connected to MongoDB!');
});


