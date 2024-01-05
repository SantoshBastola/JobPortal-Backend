const express = require("express");
const userAuth = require("../middllewares/authMiddleware");
const {
  createJobController,
  getAllJobsController,
  updateJobController,
  deleteJobController,
  jobStatsController,
} = require("../controllers/jobsController");
const router = express.Router();

router.post("/create-job", userAuth, createJobController);

router.get("/get-jobs", userAuth, getAllJobsController);

router.put("/update-job/:id", userAuth, updateJobController);

router.delete("/delete-job/:id", userAuth, deleteJobController);

router.get("/job-stats", userAuth, jobStatsController);

module.exports = router;
