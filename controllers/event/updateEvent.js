const checkInput = require("../../util/checkInput");

const HttpError = require("../../models/http-error");
const Event = require("../../models/event");

const updateEvent = async (req, res, next) => {
  const { admin, vid } = req.userData;
  if (!admin) {
    const error = new HttpError("Not allowed to update an event", 403);
    return next(error);
  }

  if (checkInput(req, next) !== 1) {
    return next();
  }

  const { name, date } = req.body;
  const { id } = req.params;

  let event;
  try {
    event = await Event.findById(id);
  } catch (err) {
    const error = new HttpError("Failed while searching for event", 500);
    return next(error);
  }

  if (!event) {
    const error = new HttpError("No event with current id found", 404);
    return next(error);
  }

  if (event.vereniging != vid) {
    const error = new HttpError("No event with current id found", 404);
    return next(error);
  }

  if (name) {
    event.name = name;
  }
  if (date) {
    event.date = date;
  }

  try {
    await event.save();
  } catch (err) {
    const error = new HttpError("Creating updated event failed", 500);
    return next(error);
  }

  res.status(200).json({ message: "event updated" });
};

module.exports = updateEvent;
