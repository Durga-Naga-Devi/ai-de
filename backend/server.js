const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/chat", (req, res) => {
  const { message, code } = req.body;

  console.log("User:", message);
  console.log("Code:", code);

  res.json({
    reply: `I received your request: "${message}". Your AI backend is working!`,
  });
});

app.listen(5000, () => {
  console.log("AI backend running on http://localhost:5000");
});
