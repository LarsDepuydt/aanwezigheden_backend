const mongoose = require("mongoose");

const checkInput = require("../../util/checkInput");

const HttpError = require("../../models/http-error");
const Event = require("../../models/event");
const User = require("../../models/user");
const Vereniging = require("../../models/vereniging");

const createEvent = async (req, res, next) => {
  const { admin, vid, userId } = req.userData;
  if (!admin) {
    const error = new HttpError("You are not allowed to create an event", 403);
    return next(error);
  }

  if (checkInput(req, next) !== 1) {
    return next();
  }

  const { name, date } = req.body;

  let vereniging;
  try {
    vereniging = await Vereniging.findById(vid);
  } catch (err) {
    const error = new HttpError("Failed while searching vereniging", 500);
    return next(error);
  }

  if (!vereniging) {
    const error = new HttpError("Vereniging not found", 404);
    return next(error);
  }

  let exactEvent;
  try {
    exactEvent = await Event.findOne({
      name: name,
      date: date,
      vereniging: vid,
    });
  } catch (err) {
    const error = new HttpError(
      "Failed while searching for duplicate event",
      500
    );
    return next(error);
  }

  if (exactEvent) {
    const error = new HttpError("Event already exists", 404);
    return next(error);
  }

  const createdEvent = new Event({
    name,
    date,
    vereniging: vid,
    onbepaald: [],
  });

  let users;
  try {
    users = await User.find(
      { "user.vereniging": vid, admin: false },
      "onbepaald"
    );
  } catch (err) {
    const error = new HttpError("Fetching all current users failed", 500);
    return next(error);
  }

  let adminUser;
  try {
    adminUser = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Fetching admin user failed", 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    for (const user of users) {
      user.onbepaald.push(createdEvent._id);
      createdEvent.onbepaald.push(user._id);
      await user.save({ session: sess });
    }
    adminUser.aanwezig.push(createdEvent._id);
    await adminUser.save({ session: sess });
    createdEvent.aanwezig.push(userId);
    vereniging.events.push(createdEvent._id);
    await vereniging.save({ session: sess });
    await createdEvent.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating event failed", 500);
    return next(err);
  }

  res.status(201).json({ eventId: createdEvent.id });
};

module.exports = createEvent;
