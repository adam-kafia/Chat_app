const socket = io();

//Elements
const message = document.getElementById("message-text");
const messageBtn = document.getElementById("button-form");
const form = document.querySelector("#message-form");
const locationButton = document.getElementById("location-btn");
const messages = document.getElementById("messages");
const chatSidebar = document.getElementById("chat__sidebar");

//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;
const imageTemplate = document.getElementById("image-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
const autoScroll = () => {
    //new message element
    const newMessage = messages.lastElementChild;

    //height of the new message element
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = messages.offsetHeight;

    //height of messages container
    const containerHeight = messages.scrollHeight;

    //how far have i scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
};

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    chatSidebar.innerHTML = html;
});

socket.on("message", (msg) => {
    console.log(msg);
    if (msg.user) {
        const html = Mustache.render(messageTemplate, {
            message: msg.text,
            createdAt: moment(msg.createdAt).format("h:mm A"),
            user: msg.user.username,
        });
        messages.insertAdjacentHTML("beforeend", html);
        autoScroll();
    } else {
        const html = Mustache.render(messageTemplate, {
            message: msg.text,
            createdAt: moment(msg.createdAt).format("h:mm A"),
            user: "Admin",
        });
        messages.insertAdjacentHTML("beforeend", html);
        autoScroll();
    }
});

socket.on("location", (e) => {
    console.log(e);
    const html = Mustache.render(locationTemplate, {
        location: e.location,
        createdAt: moment(e.createdAt).format("h:mm A"),
        user: e.user.username,
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (message.value) {
        messageBtn.disabled = true;
        socket.emit("sendMessage", message.value, (message, callback) => {
            console.log("Message received");
            messageBtn.disabled = false;
            message ? console.log("Message not sent. " + message) : console.log(callback);
        });
    }
    message.value = "";
    messageBtn.disabled = false;
    message.focus();
});

locationButton.addEventListener("click", (event) => {
    event.preventDefault();
    locationButton.disabled = true;
    navigator.geolocation ?
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("sendLocation", { latitude, longitude }, (res) => {
                console.log("Location received");
                console.log(res);
                locationButton.disabled = false;
            });
        }) :
        alert("Geolocation not supported");
});

function encodeImageFileAsURL(element) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
        socket.emit("sendImage", reader.result, () => {});
    };
    reader.readAsDataURL(file);
}
socket.on("image", (e) => {
    const html = Mustache.render(imageTemplate, {
        img: e.img,
        createdAt: moment(e.createdAt).format("h:mm A"),
        user: e.user.username,
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});