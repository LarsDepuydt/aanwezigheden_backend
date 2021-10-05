const HttpError = require("../../models/http-error");
const Event = require("../../models/event");

const getAanwezighedenEvent = async (req, res, next) => {
  const { id } = req.params;

  let event;
  try {
    event = await Event.findById(id, "aanwezig afwezig onbepaald -_id")
      .populate("aanwezig", "user.name")
      .populate("afwezig", "user.name")
      .populate("onbepaald", "user.name");
  } catch (err) {
    const error = new HttpError("Fetching event failed", 500);
    return next(error);
  }

  if (!event) {
    const error = new HttpError(
      "Could not find an event for the provided id",
      404
    );
    return next(error);
  }

  res.status(200).json({ event });
};

module.exports = getAanwezighedenEvent;
