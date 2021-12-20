const app = require("express")();
const http = require("http").createServer(app);
const cors = require("cors");
app.use(cors());

const io = require("socket.io")(http, {
  allowEIO3: true,
  cors: {
    origin: true,
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("server is running");
});

const port = 3000;
http.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});

io.sockets.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("test-connected-user", (fn) => {
    fn("Test user conectado " + socket.id);
  });
});
