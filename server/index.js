const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
        methods: ["GET"]
    }
});

if (!process.env.dev) {
    app.use(express.json());
    app.use(express.static('dist-frontend'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve('dist-frontend/index.html'));
    });
    console.log('--------------------------------');
    console.log('Running in prod-mode');
} else {
    console.log('--------------------------------');
    console.log('Running in dev-mode');
}

let settingsForRooms = new Map();
let sessionWaitingForDeletion = new Map();

http.listen(4444, () => {
    console.log('--------------------------------');
    console.log('Listening on port 4444');
    console.log('--------------------------------\n');
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
        socket.join(requestedSessionToJoin);
        const userJoinedSessionMessage = `User [${socket.id}] joined session [${requestedSessionToJoin}].`;
        io.in(requestedSessionToJoin).emit('message to all users', userJoinedSessionMessage);

        console.log('--------------------------------');
        console.log(userJoinedSessionMessage);

        if (settingsForRooms.has(requestedSessionToJoin)) {
            if (settingsForRooms.get(requestedSessionToJoin)) {
                socket.emit('settings for joined session exist', settingsForRooms.get(requestedSessionToJoin));
            }

            if (sessionWaitingForDeletion.get(requestedSessionToJoin)) {
                clearTimeout(sessionWaitingForDeletion.get(requestedSessionToJoin));
                sessionWaitingForDeletion.delete(requestedSessionToJoin);

                console.log(`Deletion of Session [${requestedSessionToJoin}] stopped.`);
                console.log(`Remaining sessions waiting for deletion:`);
                console.log(sessionWaitingForDeletion);
            }
        } else {
            settingsForRooms.set(requestedSessionToJoin, null);
        }
    });

    socket.on('sessionSettings updated', (updatedSessionSettings) => {
        let room = updatedSessionSettings.sessionId;
        io.in(room).emit('sync sessionSettings', updatedSessionSettings);
        settingsForRooms.set(room, updatedSessionSettings);

        console.log('--------------------------------');
        console.log(`User [${socket.id}] updated sessionSettings for Room [${room}].`);
    });
});

io.of('/').adapter.on('delete-room', (room) => {
    if (settingsForRooms.has(room)) {
        sessionWaitingForDeletion.set(room, setTimeout(() => deleteRoom(room), 300000));

        console.log('--------------------------------');
        console.log(`Session [${room}] waiting for deletion.`);
    }
});

function deleteRoom(room) {
    settingsForRooms.delete(room);
    clearTimeout(sessionWaitingForDeletion.get(room));
    sessionWaitingForDeletion.delete(room);

    console.log('--------------------------------');
    console.log(`Session [${room}] deleted.`);
    console.log(`Sessions waiting for deletion:`);
    console.log(sessionWaitingForDeletion);
}