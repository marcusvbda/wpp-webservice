const app = require("express")();
const http = require("http").createServer(app);
const cors = require("cors");
app.use(cors());
const botEngine = require("./bot-engine");
const EventEmitter = require("events");
const sessions = {};
const sessions_logged = {};

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
    sessions: sessions_logged,
  });
});

const port = 3000;
http.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});

io.sockets.on("connection", (socket) => {
  sessions_logged[socket.id] = null;
  const eventEmitter = new EventEmitter();

  socket.emit("connected", { id: socket.id });

  socket.on("start-engine", async (params) => {
    sessions_logged[socket.id] = params.session_id;
    let isConnected = false;

    if (sessions[params.session_id]) {
      isConnected = await sessions[params.session_id].isConnected();
    }

    if (isConnected) {
      const oldIntanceParams = sessions[params.session_id].instance_params;
      eventEmitter.emit("token-generated", { token: oldIntanceParams.token });
    } else {
      botEngine
        .start(eventEmitter, { ...params, socket_id: socket.id })
        .then((client) => {
          sessions[params.session_id] = client;
        });
    }
  });

  [
    "qr-generated",
    "session-updated",
    "token-generated",
    "session-conflict",
  ].map((event) => {
    eventEmitter.on(event, (data) => {
      socket.emit(event, data);
    });
  });

  socket.on("send-message", (data) => {
    sessions[data.session_id]
      .sendText(`${data.phone_number}@c.us`, data.body)
      .then((result) => {
        socket.emit("sent-message", result);
      })
      .catch((er) => {
        socket.emit("message-failed", er);
      });
  });

  socket.on("close-connection", (data) => {
    delete sessions_logged[data.id];
    let other_sessions = Object.keys(sessions_logged).filter((key) => {
      return sessions_logged[key] === data.session_id;
    });

    if (!other_sessions.length && sessions[data.session_id]) {
      sessions[data.session_id].close();
      delete sessions[data.session_id];
    }
  });
});
