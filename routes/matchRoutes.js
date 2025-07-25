const express = require("express");
const verifyToken = require("../verify/verify");
const { createMatch, getallMatch } = require("../controllers/matchController");
const router = express.Router();
router.get("/getallMatch", verifyToken, getallMatch);
router.post("/create-match", verifyToken, createMatch);
module.exports = router;
