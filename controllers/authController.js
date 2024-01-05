const User = require("../models/userModel");

const registerController = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name) {
    next("Name is required.");
  }
  if (!email) {
    next("Email is required.");
  }
  if (!password) {
    next("Password is required and should be greater than 6 characters.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    next("User already registered.Please try again.");
  }

  const user = await User.create({ name, email, password });

  //token
  const token = user.createJWT();
  res.status(201).send({
    success: true,
    message: "User created successfully",
    token,
    user: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
    },
  });
};

const loginController = async (req, res, next) => {
  const { email, password } = req.body;

  //Validation
  if (!email || !password) {
    next("Please provide all the fields.");
  }

  //Find user by email
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    next("Invalid email or password.");
  }
  //Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    next(`Invalid email or password`);
  }
  user.password = undefined;
  const token = user.createJWT();
  res.status(200).json({
    success: true,
    message: "Login Successful",
    user,
    token,
  });
};

module.exports = { registerController, loginController };
