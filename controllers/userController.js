const { DB } = require("../models/connection");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await DB.query("SELECT * FROM users");
    res.json({ data: users, status: 1 });
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ error: err.message, status: 0 });
  }
};

// CREATE user
exports.createUser = async (req, res) => {
  const { name, email, mobile, password, address } = req.body;

  if (!name || !email || !mobile || !password || !address) {
    return res
      .status(400)
      .json({ error: "Missing required fields", status: 0 });
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const [result] = await DB.query(
      "INSERT INTO users (name, email, mobile, password, address) VALUES (?, ?, ?, ?, ?)",
      [name, email, mobile, hash, address]
    );
    res.status(201).json({ message: "User created", status: 1 });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ error: err.message, status: 0 });
  }
};

// LOGIN user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await DB.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res
        .status(401)
        .json({ error: "Invalid email or password", status: 0 });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Invalid email or password", status: 0 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ message: "Login successful", token, status: 1 });
  } catch (err) {
    console.error("❌ Login failed:", err);
    res.status(500).json({ error: err.message, status: 0 });
  }
};
