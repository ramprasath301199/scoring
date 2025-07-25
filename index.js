const express = require("express");
const app = express();
const { DB } = require("./models/connection");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const port = process.env.PORT || 3011;
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const mactchRoutes = require("./routes/matchRoutes");
const squadRoutes = require("./routes/squadRoutes");
// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${
    req.url
  } - Body: ${JSON.stringify(req.body)}\n`;
  fs.appendFile(path.join(__dirname, "request_logs.txt"), log, (err) => {
    if (err) console.error("❌ Failed to write log:", err);
  });
  next();
});

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/team", teamRoutes);
app.use("/api/v1/match", mactchRoutes);
app.use("/api/v1/squad", squadRoutes);
// Start server
// Connect to DB first, then start server
async function startServer() {
  try {
    const connection = await DB.getConnection();
    await connection.ping(); // optional but good
    console.log("✅ Database connected");
    connection.release();

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to the database:", err.message);
    process.exit(1); // Stop server from running
  }
}

startServer();
