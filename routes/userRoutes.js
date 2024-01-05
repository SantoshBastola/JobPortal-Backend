const express = require("express");
const userAuth = require("../middllewares/authMiddleware");
const updateUserController = require("../controllers/userController");
const router = express.Router();

//Update User
router.post("/update-user", userAuth, updateUserController);

module.exports = router;
