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
    console.log(`New client [${socket.id}] connected.`);
    console.log('Number of currently connected clients: ' + io.engine.clientsCount);

    socket.on("disconnect", (reason) => {
        console.log('--------------------------------');
        console.log(`Client [${socket.id}] disconnected. Reason: ${reason}`);
        console.log('Number of currently connected clients: ' + io.engine.clientsCount);
    });

    socket.on('join session by name', (requestedSessionToJoin) => {
        console.log('--------------------------------');
        socket.join(requestedSessionToJoin);
        const userJoinedSessionMessage = `User [${socket.id}] joined session [${requestedSessionToJoin}].`;
        io.in(requestedSessionToJoin).emit('message to all users', userJoinedSessionMessage);
        console.log(userJoinedSessionMessage);
    });

    socket.on('sessionSettings updated', (updatedSessionSettings) => {
        let room = updatedSessionSettings.sessionId;
        io.in(room).emit('sync sessionSettings', updatedSessionSettings);
        console.log('--------------------------------');
        console.log(`User [${socket.id}] updated sessionSettings for Room [${room}].`);
    });
});

io.of("/").adapter.on("create-room", (room) => {
    console.log(`Room [${room}] was created`);
});