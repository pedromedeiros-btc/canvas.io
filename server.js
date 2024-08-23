const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');

app.use(express.static('public'));

const users = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    const userId = uuidv4();
    users.set(socket.id, { id: userId });
    socket.emit('assignId', userId);

    socket.on('draw', (data) => {
        io.emit('draw', { ...data, userId: users.get(socket.id).id });
    });

    socket.on('clear', () => {
        io.emit('clear');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users.delete(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});