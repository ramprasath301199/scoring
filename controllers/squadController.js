const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const { DB } = require("../models/connection");

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx files are allowed"), false);
  }
};

exports.upload = multer({ storage, fileFilter });

// GET all squad for a specific team
exports.getAllSquad = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await DB.query(
      "SELECT * FROM teamsquad WHERE teamId = ?",
      [id]
    );
    res.json({ data: results, status: 1 });
  } catch (err) {
    console.error("❌ Error fetching squad:", err);
    res.status(500).json({ error: err.message, status: 0 });
  }
};

// ADD single squad member
exports.addSquad = async (req, res) => {
  const { teamId, mobile, firstname, lastname, profile } = req.body;

  if (!teamId || !firstname || !lastname || !mobile) {
    return res
      .status(400)
      .json({ error: "Missing required fields", status: 0 });
  }

  try {
    const [result] = await DB.query(
      "INSERT INTO teamsquad (teamId, mobile, firstname, lastname, profileurl) VALUES (?, ?, ?, ?, ?)",
      [teamId, mobile, firstname, lastname, profile]
    );
    res.status(201).json({ message: "Member added", status: 1 });
  } catch (err) {
    console.error("❌ Error adding squad member:", err);
    res.status(500).json({ error: err.message, status: 0 });
  }
};

// ADD squad members via Excel
exports.addExcel = async (req, res) => {
  console.log(req.file)
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded", status: 0 });
  }

  const filePath = path.resolve(req.file.path);

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      return res
        .status(400)
        .json({ message: "Excel file is empty", status: 0 });
    }

    const insertPromises = sheetData.map((row) => {
      return DB.query(
        "INSERT INTO teamsquad (teamId, mobile, firstname, lastname, profileurl) VALUES (?, ?, ?, ?, ?)",
        [row.teamId, row.mobile, row.firstname, row.lastname, row.profile]
      );
    });

    await Promise.all(insertPromises);

    res.json({
      message: "Members added successfully",
      data: sheetData,
      status: 1,
    });
  } catch (err) {
    console.error("❌ Excel upload failed:", err);
    res.status(500).json({ error: err.message, status: 0 });
  } finally {
    // Optional: delete uploaded file after processing
    fs.unlink(filePath, (err) => {
      if (err) console.warn("⚠️ Could not delete uploaded file:", filePath);
    });
  }
};
