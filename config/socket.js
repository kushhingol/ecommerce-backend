const socketIo = require("socket.io");

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("New client connected");

      socket.on("subscribeToOrder", (orderId, userId) => {
        socket.join(userId);
        console.log(`User ${userId} subscribed to order ${orderId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
