// import { Server as SocketIOServer } from "socket.io";

// const setupSocket = (server) => {
//   const io = new SocketIOServer(server, {
//     cors: {
//       origin: " http://localhost:3000",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   const userSocketMap = new Map();

//   const disconnect = (socket) => {
//     console.log(`Client Disconnected ${socket.id}`);
//     for (const [userId, socketId] of userSocketMap.entries()) {
//       if (socketId === socket.id) {
//         userSocketMap.delete(userId);
//         break;
//       }
//     }
//   };

//   io.on("connection", (socket) => {
//     const userId = socket.handshake.query.userId;

//     if (userId) {
//       userSocketMap.set(userId, socket.id);
//       console.log(`user connected : ${userId} with socket Id: ${socket.id}`);
//     } else {
//       console.log("user ID not provided during connection");
//     }
//   });

//   socket.on("disconnect", () => disconnect(socket));
// };

// module.exports = setupSocket;

const { Server: SocketIOServer } = require("socket.io");
const { Message } = require("./models/message");

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const sendMessage = async (message) => {
    console.log("message", message);
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    if (!senderSocketId) {
      console.error(`Sender socket ID not found for user: ${message.sender}`);
    }

    if (!recipientSocketId) {
      console.error(
        `Recipient socket ID not found for user: ${message.recipient}`
      );
    }

    try {
      const createdMessage = await Message.create(message);

      const messageData = await Message.findById(createdMessage.id)
        .populate("sender", "id email name")
        .populate("recipient", "id email name");

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("recieveMessage", messageData);
      }

      if (senderSocketId) {
        io.to(senderSocketId).emit("senderMessage", messageData);
      }
    } catch (error) {
      console.error("Error handling sendMessage event:", error);
    }
  };

  const disconnect = (socket) => {
    console.log(`Client Disconnected ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection");
    }

    socket.on("sendMessage", sendMessage);

    socket.on("disconnect", () => disconnect(socket));
  });
};

module.exports = setupSocket;
