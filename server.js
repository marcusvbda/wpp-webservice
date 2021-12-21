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

  socket.emit("connected", { id: socket.id });

  const closeConnection = (session_id) => {
    if (sessions[session_id]) {
      sessions[session_id].close();
    }
  };

  socket.on("start-engine", (params) => {
    botEngine.start(eventEmitter, params).then((client) => {
      sessions[params.session_id] = client;
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

  socket.on("close-connection", ({ session_id }) => {
    closeConnection(session_id);
  });
});
