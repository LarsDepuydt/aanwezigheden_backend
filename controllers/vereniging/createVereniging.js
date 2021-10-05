const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const checkInput = require("../../util/checkInput");

const HttpError = require("../../models/http-error");
const Vereniging = require("../../models/vereniging");
const User = require("../../models/user");

const createVereniging = async (req, res, next) => {
  if (checkInput(req, next) !== 1) {
    return next();
  }
  const { name, username, password } = req.body;

  let existingVereniging;
  try {
    existingVereniging = await Vereniging.findOne({ name: name.toLowerCase() });
  } catch (err) {
    const error = new HttpError(
      "Failed while searching for an existing vereniging",
      500
    );
    return next(error);
  }
  console.log(existingVereniging);
  if (existingVereniging) {
    const error = new HttpError("Vereniging alreading exists", 422);
    return next(error);
  }

  const createdVereniging = new Vereniging({
    name: name,
  });

  // #################################
  // new user part
  // #################################

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, hashing password failed",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    user: { vereniging: createdVereniging._id, name: username.toLowerCase() },
    password: hashedPassword,
    admin: true,
    onbepaald: [],
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdUser.save({ session: sess });
    createdVereniging.users.push(createdUser);
    await createdVereniging.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Saving events failed", 500);
    return next(err);
  }

  const info = {
    userId: createdUser.id,
    username: createdUser.username,
    vid: createdVereniging.id,
    admin: true,
  };

  let token;
  try {
    token = jwt.sign(info, process.env.JWT_KEY, { expiresIn: "30m" });
  } catch (err) {
    const error = new HttpError("Creating web token failed", 500);
    return next(err);
  }

  res
    .status(201)
    .json({ id: createdVereniging.id, token, userId: createdUser.id });
};

module.exports = createVereniging;
