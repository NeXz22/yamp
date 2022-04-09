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


io.on("connection", (socket) => {
    console.log('--------------------------------');
    console.log('New client connected. Client-ID: ' + socket.id);
    console.log('Number of currently connected clients: ' + io.engine.clientsCount);

    socket.on("disconnect", (reason) => {
        console.log('--------------------------------');
        console.log('Client disconnected. Client-ID: ' + socket.id + '. Reason: ' + reason);
        console.log('Number of currently connected clients: ' + io.engine.clientsCount);
    });

    socket.on('join session by name', (requestedSessionToJoin) => {
        socket.join(requestedSessionToJoin);
        const userJoinedSessionMessage = `User [${socket.id}] joined session [${requestedSessionToJoin}].`;
        io.in(requestedSessionToJoin).emit('message to all users', userJoinedSessionMessage);
        console.log(userJoinedSessionMessage);
    });
});

io.of("/").adapter.on("create-room", (room) => {
    console.log(`Room [${room}] was created`);
});