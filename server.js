const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = 0;

app.use(express.static("public"));

const users = [];

io.on("connection", socket => {
  if (users.length >= 2) {
    socket.emit("room-full");
    socket.disconnect();
    return;
  }

  users.push(socket);

  if (users.length === 2) {
    users[0].emit("peer-ready");
    users[1].emit("peer-ready");
  }

  socket.on("signal", data => {
    const other = users.find(u => u !== socket);
    if (other) other.emit("signal", data);
  });

  socket.on("disconnect", () => {
    const i = users.indexOf(socket);
    if (i !== -1) users.splice(i, 1);
  });
});

// Keep sockets alive
setInterval(() => {
  io.emit("ping");
}, 15000);
