const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../verify/verify");
router.get("/user", verifyToken, userController.getAllUsers);
router.post("/createuser", userController.createUser);
router.post("/loginuser", userController.login);
module.exports = router;
