const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const Filter = require("bad-words");
const {
    generateMessage,
    generateLocationMessage,
    generateImage,
} = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const filter = new Filter();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT;
const publicDir = path.join(__dirname, "../public");

app.use(express.json());
app.use(express.static(publicDir));

app.get("/", (req, res) => {
    res.render("index.html");
});

io.on("connection", (socket) => {
    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            console.log(error);
            return callback(error);
        }

        socket.join(room);

        socket.emit("message", generateMessage("Welcome to the Chat app"));

        socket.broadcast
            .to(user.room)
            .emit("message", generateMessage(`${user.username} has joined.`));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
        callback();
    });

    socket.on("sendMessage", (message, callback) => {
        const { user, error } = getUser(socket.id);
        if (error) callback(error);
        if (filter.isProfane(message)) {
            callback("Profanity is not allowed");
        }
        io.to(user.room).emit("message", generateMessage(message, user));
        callback(undefined, "Delivered");
    });

    socket.on("sendImage", (image, callback) => {
        const { user, error } = getUser(socket.id);
        if (error) callback(error);
        io.to(user.room).emit("image", generateImage(image, user));
    });

    socket.on("sendLocation", (e, callback) => {
        const { user, error } = getUser(socket.id);
        if (error) callback(error);
        io.emit(
            "location",
            generateLocationMessage(
                `https://google.com/maps?q=${e.latitude},${e.longitude}`,
                user
            )
        );
        callback("Location shared");
    });
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                "message",
                generateMessage(`${user.username} has left.`)
            );
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

server.listen(port, () => console.log("Server up and running on port " + port));