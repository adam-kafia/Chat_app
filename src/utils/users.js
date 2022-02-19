const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return { error: "Username and room are required" };
    }
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });
    if (existingUser) {
        return { error: "Username already in use" };
    }
    const user = { id, username, room };
    users.push(user);

    return { user };
};

const removeUser = (id) => {
    const i = users.findIndex((user) => {
        return user.id === id;
    });
    if (i <= -1) return { error: "User not found" };

    return users.splice(i, 1)[0];
};
const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id;
    });
    if (!user) return { error: "User not found" };
    return { user };
};
const getUsersInRoom = (room) => {
    if (!room) return { error: "Room must be specified" };
    const usersInRoom = users.filter((user) => {
        return user.room === room;
    });
    if (usersInRoom.length === 0) return { error: "Room is empty" };
    return usersInRoom;
};
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};