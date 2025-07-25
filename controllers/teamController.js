const { DB } = require("../models/connection");

// GET all teams
exports.getAllTeams = async (req, res) => {
  try {
    const [teams] = await DB.query("SELECT * FROM teams");
    res.json({ data: teams, status: 1 });
  } catch (err) {
    console.error("❌ Error fetching teams:", err);
    res.status(500).json({ error: err.message, status: 0 });
  }
};

// CREATE team
exports.createTeam = async (req, res) => {
  const { name, image, city } = req.body;

  if (!name || !image || !city) {
    return res.status(400).json({ error: "Missing required fields", status: 0 });
  }

  try {
    const [result] = await DB.query(
      "INSERT INTO teams (name, image, city) VALUES (?, ?, ?)",
      [name, image, city]
    );
    res.status(201).json({ message: "Team created", status: 1 });
  } catch (err) {
    console.error("❌ Error creating team:", err);
    res.status(500).json({ error: err.message, status: 0 });
  }
};

