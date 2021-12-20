const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

const port = 3000;

app.get("/", (req, res) => {
  res.send("Api is running ...");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
