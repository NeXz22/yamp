const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:4200",
    }
});

http.listen(4444, () => {
    console.log('Listening on port 4444');
});

io.on("connection", () => {
    console.log('new client connected.');
});