const express = require("express");
const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {});
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

// Export the function if needed
module.exports = dbConnect;
