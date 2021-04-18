const mongoose = require("mongoose");

const checkInput = require("../../util/checkInput");
const updateEventStatus = require("./updateUtil/updateUtil");

const HttpError = require("../../models/http-error");
const User = require("../../models/user");
const Event = require("../../models/event");

const updateAanwezigheid = async (req, res, next) => {
  if (checkInput(req, next) !== 1) {
    return next();
  }

  const { aanwezig, afwezig, onbepaald } = req.body;
  const { userId } = req.userData;

  if (!aanwezig && !afwezig && !onbepaald) {
    const error = new HttpError("No id send with the request", 422);
    return next(error);
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("No user with current id found", 500);
    return next(error);
  }

  let mongooseAanwezigheden = [];
  let mongooseAfwezigheden = [];
  let mongooseOnbepaald = [];

  aanwezig &&
    aanwezig.map((item) => {
      mongooseAanwezigheden.push(mongoose.Types.ObjectId(item));
    });

  afwezig &&
    afwezig.map((item) => {
      mongooseAfwezigheden.push(mongoose.Types.ObjectId(item));
    });

  onbepaald &&
    onbepaald.map((item) => {
      mongooseOnbepaald.push(mongoose.Types.ObjectId(item));
    });

  let aanwezigEvents;
  if (mongooseAanwezigheden.length !== 0) {
    try {
      aanwezigEvents = await Event.find(
        {
          _id: { $in: mongooseAanwezigheden },
        },
        "aanwezig afwezig onbepaald"
      );
    } catch (err) {
      const error = new HttpError("Retrieving aanwezig events failed", 500);
      return next(error);
    }
  }

  let afwezigEvents;
  if (mongooseAfwezigheden.length !== 0) {
    try {
      afwezigEvents = await Event.find(
        {
          _id: { $in: mongooseAfwezigheden },
        },
        "aanwezig afwezig onbepaald"
      );
    } catch (err) {
      const error = new HttpError("Retrieving afwezig events failed", 500);
      return next(error);
    }
  }

  let onbepaaldEvents;
  if (mongooseOnbepaald.length !== 0) {
    try {
      onbepaaldEvents = await Event.find(
        {
          _id: { $in: mongooseOnbepaald },
        },
        "onbepaald"
      );
    } catch (err) {
      const error = new HttpError("Retrieving onbepaald events failed", 500);
      return next(error);
    }
  }

  let newObject;
  if (aanwezig) {
    newObject = updateEventStatus(
      aanwezig,
      user,
      aanwezigEvents,
      "aanwezig",
      userId
    );
    user = newObject[0];
    aanwezigEvents = newObject[1];
  }

  if (afwezig) {
    newObject = updateEventStatus(
      afwezig,
      user,
      afwezigEvents,
      "afwezig",
      userId
    );
    user = newObject[0];
    afwezigEvents = newObject[1];
  }

  if (onbepaald) {
    user.onbepaald.push(onbepaald);
    onbepaald.map((id) => {
      const i = onbepaald.indexOf(id);
      onbepaaldEvents[i].onbepaald.push(userId);
    });
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await user.save({ session: sess });
    if (aanwezigEvents) {
      for (const aanwezig of aanwezigEvents) {
        await aanwezig.save({ session: sess });
      }
    }
    if (afwezigEvents) {
      for (const afwezig of afwezigEvents) {
        await afwezig.save({ session: sess });
      }
    }
    if (onbepaaldEvents) {
      for (const onbepaald of onbepaaldEvents) {
        await onbepaald.save({ session: sess });
      }
    }
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Updating user status failed", 500);
    return next(err);
  }

  res.status(200).json({
    message: "updated with succes",
  });
};

module.exports = updateAanwezigheid;
