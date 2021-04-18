const checkInput = require("../../util/checkInput");

const HttpError = require("../../models/http-error");
const Vereniging = require("../../models/vereniging");

const updateVereniging = async (req, res, next) => {
  const { admin, vid } = req.userData;
  if (!admin) {
    const error = new HttpError("Not allowed to update vereniging", 403);
    return next(error);
  }

  if (checkInput(req, next) !== 1) {
    return next();
  }

  const { name } = req.body;

  let vereniging;
  try {
    vereniging = await Vereniging.findById(vid);
  } catch (err) {
    const error = new HttpError("Failed while searching for vereniging", 500);
    return next(error);
  }

  if (!vereniging) {
    const error = new HttpError("No vereniging with current id found", 404);
    return next(error);
  }

  if (name) {
    vereniging.name = name;
  }

  try {
    await vereniging.save();
  } catch (err) {
    const error = new HttpError("Creating updated vereniging failed", 500);
    return next(error);
  }

  res.status(201).json({ vereniging });
};

module.exports = updateVereniging;
