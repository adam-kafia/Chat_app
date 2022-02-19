const generateMessage = (text, user) => {
    return {
        text,
        createdAt: new Date().getTime(),
        user,
    };
};

const generateLocationMessage = (location, user) => {
    return {
        location,
        createdAt: new Date().getTime(),
        user,
    };
};

const generateImage = (img, user) => {
    return {
        img,
        createdAt: new Date().getTime(),
        user,
    };
};

module.exports = {
    generateMessage,
    generateLocationMessage,
    generateImage,
};