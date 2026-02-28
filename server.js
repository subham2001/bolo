const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = 0;

app.use(express.static("public"));

io.on("connection", socket => {
  if (users >= 2) {
    socket.emit("room-full");
    socket.disconnect();
    return;
  }

  users++;
  socket.broadcast.emit("peer-joined");

  socket.on("signal", data => {
    socket.broadcast.emit("signal", data);
  });

  socket.on("disconnect", () => {
    users--;
  });
});

server.listen(process.env.PORT || 3000);
