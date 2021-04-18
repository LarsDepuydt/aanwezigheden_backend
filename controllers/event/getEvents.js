const HttpError = require("../../models/http-error");
const User = require("../../models/user");

const getEvents = async (req, res, next) => {
  const { userId } = req.userData;

  let events;
  try {
    events = await User.findById(userId, "aanwezig afwezig onbepaald")
      .populate("aanwezig", "name date")
      .populate("afwezig", "name date")
      .populate("onbepaald", "name date");
  } catch (err) {
    const error = new HttpError("Fetching events failed", 500);
    return next(err);
  }

  res.status(200).json({ events });
};

module.exports = getEvents;
