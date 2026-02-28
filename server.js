const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = []; // store 2 sockets

app.use(express.static("public"));

io.on("connection", socket => {
  // Limit to 2 users
  if (users.length >= 2) {
    socket.emit("room-full");
    socket.disconnect();
    return;
  }

  users.push(socket);

  // When both present, notify
  if (users.length === 2) {
    users.forEach(s => s.emit("peer-ready"));
  }

  // Relay signals directly
  socket.on("signal", data => {
    const other = users.find(s => s !== socket);
    if (other) other.emit("signal", data);
  });

  socket.on("disconnect", () => {
    const i = users.indexOf(socket);
    if (i !== -1) users.splice(i, 1);
  });
});

server.listen(process.env.PORT || 3000);
