const express = require("express");
const cors = require("cors");
const responseTime = require("response-time");

const app = express();

app.use(express.json());
app.use(cors());
app.use(responseTime());

app.get("/", function (req, res) {
  res.json({ message: "hi" });
});

app.use("/api/redis", require("./routes/redis.route"));

const PORT = 1212 || process.env.PORT;
app.listen(PORT, function () {
  console.log(`The URL: http://localhost:${PORT}`);
});
