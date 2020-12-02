const qrcode = require("qrcode");
const fs = require("fs");
const socketIO = require("socket.io");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Client } = require("whatsapp-web.js");

const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var commandList = [
  { command: "1", reply: "One" },
  { command: "2", reply: "Two" },
  { command: "3", reply: "Three" },
];
const SESSION_FILE_PATH = "./session.json";
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

const client = new Client({
  puppeteer: { headless: true },
  session: sessionCfg,
});

client.on("authenticated", (session) => {
  console.log("AUTHENTICATED", session);
  sessionCfg = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
    if (err) {
      console.error(err);
    }
  });
});

client.on("message", async (msg) => {
  console.log("MESSAGE RECEIVED", msg);
  const command = commandList.find((element) => element.command == msg.body);
  if (command) client.sendMessage(msg.from, command.reply);
});

client.initialize();

// Socket IO
io.on("connection", (socket) => {
  socket.emit("message", "Connecting...");

  client.on("qr", (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit("message", "Please scan the QR code using WhatsApp.");
    });
  });

  client.on("ready", () => {
    socket.emit("message", "The WhatsApp bot is ready");
  });
});

// Send message
app.post("/send-message", (req, res) => {
  const number = req.body.number;
  const message = req.body.message;

  client
    .sendMessage(number, message)
    .then((response) => {
      res.status(200).json({
        status: true,
        response: response,
      });
    })
    .catch((err) => {
      res.status(200).json({
        status: false,
        response: err,
      });
    });
});

app.post("/post-commands", (req, res) => {
  console.log(req.body);
  commandList = req.body;
  console.log(commandList);
  res.status(200).json({
    status: true,
  });
});

server.listen(port, () => {
  console.log("App running on port:" + port);
});
