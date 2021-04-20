const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const checkInput = require("../../util/checkInput");
const HttpError = require("../../models/http-error");

const User = require("../../models/user");
const Event = require("../../models/event");
const Vereniging = require("../../models/vereniging");

const createUser = async (req, res, next) => {
  if (checkInput(req, next) !== 1) {
    return next();
  }
  const { username, password, geboortejaar } = req.body;
  const { vid } = req.userData;

  let existingUser;
  try {
    existingUser = await User.findOne({
      "user.vereniging": vid,
      "user.name": username.toLowerCase(),
    });
  } catch (err) {
    const error = new HttpError(
      "Failed while searching for an existing user",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User alreading exists", 422);
    return next(error);
  }

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
    user: { vereniging: vid, name: username.toLowerCase() },
    password: hashedPassword,
    geboortejaar,
    admin: false,
    onbepaald: [],
  });

  let vereniging;
  try {
    vereniging = await Vereniging.findById(vid);
  } catch (err) {
    const error = new HttpError("Failed while searching vereniging", 500);
    return next(error);
  }

  if (!vereniging) {
    const error = new HttpError(
      "Could not find vereniging for provided id.",
      422
    );
    return next(error);
  }

  let events;
  try {
    events = await Event.find({ vereniging: vid }, "onbepaald");
  } catch (err) {
    const error = new HttpError("Finding events failed", 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    for (const event of events) {
      event.onbepaald.push(createdUser._id);
      createdUser.onbepaald.push(event._id);
      await event.save({ session: sess });
    }
    await createdUser.save({ session: sess });
    vereniging.users.push(createdUser);
    await vereniging.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Saving events failed", 500);
    return next(error);
  }

  const info = {
    userId: createdUser.id,
    username: createdUser.username,
    vid: createdUser.vereniging,
    admin: false,
  };

  let token;
  try {
    token = jwt.sign(info, process.env.JWT_KEY, { expiresIn: "30m" });
  } catch (err) {
    const error = new HttpError("Creating web token failed", 500);
    return next(err);
  }

  res.status(201).json({ userId: createdUser.id, token });
};

module.exports = createUser;
