const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors({
  origin: "https://electryonz-symposium-website.vercel.app",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

app.use("/api", require("./routes/checkEmail"));
app.use("/api", require("./routes/register"));
app.use("/api", require("./routes/payment"));
app.use("/api", require("./routes/qr"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ✅ Export for Vercel serverless
module.exports = app;