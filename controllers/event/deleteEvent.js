const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Event = require("../../models/event");
const User = require("../../models/user");

const deleteEvent = async (req, res, next) => {
  const { admin, vid } = req.userData;
  if (!admin) {
    const error = new HttpError("Not allowed to delete an event", 403);
    return next(error);
  }

  const { id } = req.params;

  let users;
  try {
    users = await User.find(
      { "user.vereniging": vid },
      "aanwezig afwezig onbepaald"
    );
  } catch (err) {
    const error = new HttpError("Error while searching all users", 500);
    return next(error);
  }

  let event;
  try {
    event = await Event.findById(id).populate("vereniging");
  } catch (err) {
    const error = new HttpError("Error while searching event", 500);
    return next(error);
  }

  if (!event) {
    const error = new HttpError("Event not found", 404);
    return next(error);
  }

  if (event.vereniging._id != vid) {
    const error = new HttpError("Event not found", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    if (users) {
      for (const user of users) {
        if (user.onbepaald.indexOf(id) !== -1) {
          user.onbepaald.pull(id);
        } else if (user.afwezig.indexOf(id) !== -1) {
          user.afwezig.pull(id);
        } else if (user.aanwezig.indexOf(id) !== -1) {
          user.aanwezig.pull(id);
        }

        await user.save({ session: sess });
      }
    }
    await event.remove({ session: sess });
    event.vereniging.events.pull(event);
    await event.vereniging.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Deleting event failed", 500);
    return next(error);
  }

  res.status(200).json({ message: "Event deleted!" });
};

module.exports = deleteEvent;
