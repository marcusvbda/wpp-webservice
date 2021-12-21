const app = require("express")();
const http = require("http").createServer(app);
const cors = require("cors");
app.use(cors());
const botEngine = require("./bot-engine");
const EventEmitter = require("events");
const sessions = {};

const io = require("socket.io")(http, {
  allowEIO3: true,
  cors: {
    origin: true,
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "webservice is running ...",
    sessions: Object.keys(sessions),
  });
});

const port = 3000;
http.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});

io.sockets.on("connection", (socket) => {
  const eventEmitter = new EventEmitter();
  sessions[socket.id] = null;

  socket.on("start-engine", ({ token }) => {
    botEngine.start(eventEmitter, socket.id, token).then((client) => {
      sessions[socket.id] = client;
    });
  });

  [
    "qr-generated",
    "session-updated",
    "token-generated",
    "sent-message",
    "message-failed",
  ].map((event) => {
    eventEmitter.on(event, (data) => {
      socket.emit(event, data);
    });
  });

  socket.on("send-message", (data) => {
    eventEmitter.emit("send-message", data);
  });

  const closeConnection = () => {
    if (sessions[socket.id]) {
      sessions[socket.id].close();
    }
  };

  socket.on("close-connection", () => {
    closeConnection();
  });

  socket.on("disconnect", () => {
    closeConnection();
  });
});
