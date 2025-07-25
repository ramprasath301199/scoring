const express = require("express");
const router = express.Router();
const verifyToken = require("../verify/verify");
const multer = require("multer");
const XLSX = require("xlsx");
const {
  getAllSquad,
  addSquad,
  addExcel,
} = require("../controllers/squadController");
const upload = multer({ dest: "uploads/" });
router.get("/team/:id", verifyToken, getAllSquad);
router.post("/team/add", verifyToken, addSquad);
router.post("/add-excel", verifyToken, upload.single("file"), addExcel);
module.exports = router;
