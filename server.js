const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = [];

app.use(express.static("public"));

io.on("connection", socket => {
  // Limit room to 2 people
  if (users.length >= 2) {
    socket.emit("room-full");
    socket.disconnect();
    return;
  }

  users.push(socket);

  // Relay messages directly
  socket.on("message", msg => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", () => {
  users = users.filter(u => u !== socket);

  // Tell remaining user the room ended
  socket.broadcast.emit("room-ended");
});
});

server.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
