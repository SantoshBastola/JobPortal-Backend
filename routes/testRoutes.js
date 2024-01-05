const express = require("express");
const testPostController = require("../controllers/testController");
const userAuth = require("../middllewares/authMiddleware");
const router = express.Router();

//Routes Here
router.post("/test-post", userAuth, testPostController);

module.exports = router;
