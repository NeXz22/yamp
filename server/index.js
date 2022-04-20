const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const socketIO = require('socket.io');


let io;
let settingsForRooms = new Map();
let sessionWaitingForDeletion = new Map();


setupEnvironment();
configureServer();
startServer();


io.on("connection", (socket) => {
    log(`New client [${socket.id}] connected. \nNumber of currently connected clients: ${io.engine.clientsCount}`);

    socket.on("disconnect", (reason) => {
        log(`Client [${socket.id}] disconnected. Reason: ${reason} \nNumber of currently connected clients: ${io.engine.clientsCount}`);
    });

    socket.on('join session by name', (requestedSessionToJoin) => {
        socket.join(requestedSessionToJoin);
        const userJoinedSessionMessage = `User [${socket.id}] joined session [${requestedSessionToJoin}].`;
        io.in(requestedSessionToJoin).emit('message to all users', userJoinedSessionMessage);
        log(userJoinedSessionMessage);

        if (settingsForRooms.has(requestedSessionToJoin)) {
            if (settingsForRooms.get(requestedSessionToJoin)) {
                socket.emit('settings for joined session exist', settingsForRooms.get(requestedSessionToJoin));
            }

            if (sessionWaitingForDeletion.get(requestedSessionToJoin)) {
                clearTimeout(sessionWaitingForDeletion.get(requestedSessionToJoin));
                sessionWaitingForDeletion.delete(requestedSessionToJoin);
                log(`Deletion of Session [${requestedSessionToJoin}] stopped.`, true);
            }
        } else {
            settingsForRooms.set(requestedSessionToJoin, null);
        }
    });

    socket.on('sessionSettings updated', (updatedSessionSettings) => {
        let room = updatedSessionSettings.sessionId;
        io.in(room).emit('sync sessionSettings', updatedSessionSettings);
        settingsForRooms.set(room, updatedSessionSettings);
        log(`User [${socket.id}] updated sessionSettings for Room [${room}].`);
    });
});


io.of('/').adapter.on('delete-room', (room) => {
    if (settingsForRooms.has(room)) {
        sessionWaitingForDeletion.set(room, setTimeout(() => deleteRoom(room), 300000));
        log(`Session [${room}] waiting for deletion.`, true);
    }
});


function setupEnvironment() {
    const environment = process.env.NODE_ENV || 'production';
    require('dotenv').config({path: path.resolve(`./.env.${environment}`)});
}


function configureServer() {
    const allowedOrigins = process.env.CORS_ORIGIN.split(',');

    io = socketIO(http, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET"]
        }
    });

    if (process.env.ENVIRONMENT === 'PRODUCTION') {
        app.use(express.json());
        app.use(express.static('dist-frontend'));
        app.get('*', (req, res) => {
            res.sendFile(path.resolve('dist-frontend/index.html'));
        });
    }

    log(`Running in ${process.env.ENVIRONMENT}-mode \nAllowed CORS-Origins: ${allowedOrigins}`);
}


function startServer() {
    http.listen(process.env.PORT, () => {
        log(`Listening on port ${process.env.PORT}`, true);
    });
}


function deleteRoom(room) {
    settingsForRooms.delete(room);
    clearTimeout(sessionWaitingForDeletion.get(room));
    sessionWaitingForDeletion.delete(room);
    log(`Session [${room}] deleted.`, true);
}


function log(message, logDate) {
    if (logDate) {
        console.log(`-- ${new Date().toISOString()} --`);
    }
    console.log(message);
    console.log('--------------------------------');
}