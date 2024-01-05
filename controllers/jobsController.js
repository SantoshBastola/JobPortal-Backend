const Job = require("../models/jobsModel");
const mongoose = require("mongoose");
const moment = require("moment");

const createJobController = async (req, res, next) => {
  const { company, position } = req.body;
  if (!company || !position) {
    next("Please Provide All Fields");
  }
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(201).json({ job });
};

const getAllJobsController = async (req, res, next) => {
  const { status, workType, search, sort } = req.query;
  //Conditions for searching filters
  const queryObject = {
    createdBy: req.user.userId,
  };

  if (status && status != "all") {
    queryObject.status = status;
  }
  if (workType && workType != "all") {
    queryObject.workType = workType;
  }

  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }

  let queryResult = Job.find(queryObject);

  //Sorting
  if (sort === "latest") {
    queryResult = queryResult.sort("-createdAt");
  }
  if (sort === "oldest") {
    queryResult = queryResult.sort("createdAt");
  }
  if (sort === "a-z") {
    queryResult = queryResult.sort("position");
  }
  if (sort === "z-a") {
    queryResult = queryResult.sort("-position");
  }

  //Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  queryResult = queryResult.skip(skip).limit(limit);

  //Jobs Count
  const totalJobs = await Job.countDocuments(queryResult);
  const numOfPage = Math.ceil(totalJobs / limit);

  const jobs = await queryResult;
  //   const jobs = await Job.find({ createdBy: req.user.userId });
  res.status(200).json({
    totalJobs,
    jobs,
    numOfPage,
  });
};

const updateJobController = async (req, res, next) => {
  const { id } = req.params;
  const { company, position } = req.body;

  //validation
  if (!company || !position) {
    next("Please provide all the fields.");
  }
  //find job
  const job = await Job.findOne({ _id: id });

  //   validation
  if (!job) {
    next(`Couldnt find the job for the id ${id}`);
  }
  console.log("req.user.userId:", req.user.userId);
  console.log("job.createdBy:", job.createdBy.toString());

  if (!req.user.userId === job.createdBy.toString()) {
    next("You are not authorized to update this job.");
    return;
  }
  const updateJob = await Job.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  //res
  res.status(200).json({ updateJob });
};

const deleteJobController = async (req, res, next) => {
  const { id } = req.params;
  //find job
  const job = await Job.findOne({ _id: id });
  //validation
  if (!job) {
    next(`No Job Found With This ID ${id}`);
  }
  if (!req.user.userId === job.createdBy.toString()) {
    next("Your Not Authorize to delete this job");
    return;
  }
  await job.deleteOne();
  res.status(200).json({ message: "Success, Job Deleted!" });
};

const jobStatsController = async (req, res, next) => {
  const stats = await Job.aggregate([
    //search by user job
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  //Default Stats
  const defaultStats = {
    pending: stats.pending || 0,
    reject: stats.reject || 0,
    interview: stats.interview || 0,
  };

  //Monthly/Yearly Stats
  let monthlyApplication = await Job.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  monthlyApplication = monthlyApplication
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    .reverse();

  res
    .status(200)
    .json({ totalJobs: stats.length, defaultStats, monthlyApplication });
};

module.exports = {
  createJobController,
  getAllJobsController,
  updateJobController,
  deleteJobController,
  jobStatsController,
};
