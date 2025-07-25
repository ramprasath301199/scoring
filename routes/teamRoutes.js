const express = require("express");
const { getAllTeams, createTeam } = require("../controllers/teamController");
const verifyToken = require("../verify/verify");
const router = express.Router();
router.get("/getallteams", verifyToken, getAllTeams);
router.post("/createteam", verifyToken, createTeam);
module.exports = router;
