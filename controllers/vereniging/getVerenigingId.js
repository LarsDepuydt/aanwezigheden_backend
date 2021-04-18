const HttpError = require("../../models/http-error");
const Vereniging = require("../../models/vereniging");

const getVerenigingId = async (req, res, next) => {
  const { name } = req.query;

  let vereniging;
  try {
    vereniging = await Vereniging.findOne({ name: name }, "id");
  } catch (err) {
    const error = new HttpError("Fetching vereniging id failed", 500);
    return next(error);
  }

  if (!vereniging) {
    const error = new HttpError("Vereniging not found", 404);
    return next(error);
  }

  res.status(200).json({ vid: vereniging.id });
};

module.exports = getVerenigingId;
