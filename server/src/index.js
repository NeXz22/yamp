const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(4444, () => {
    console.log('Listening on port 4444');
});

io.on("connection", () => {
    console.log('new client connected!');
});