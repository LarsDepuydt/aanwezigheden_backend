const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

const checkInput = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  } else {
    return 1;
  }
};

module.exports = checkInput;
