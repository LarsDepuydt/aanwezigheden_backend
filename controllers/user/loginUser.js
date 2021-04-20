const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const checkInput = require("../../util/checkInput");

const User = require("../../models/user");
const Vereniging = require("../../models/vereniging");
const HttpError = require("../../models/http-error");

const login = async (req, res, next) => {
  if (checkInput(req, next) !== 1) {
    return next();
  }

  const { username, password } = req.body;
  const { vname } = req.params;
  const vname_spaced = vname.replace("-", " ");

  let vid;
  try {
    vereniging = await Vereniging.findOne(
      {
        name: vname_spaced,
      },
      "id"
    );
    vid = vereniging._id;
  } catch (err) {
    const error = new HttpError(
      "Failed while searching for vereniging id",
      500
    );
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({
      "user.vereniging": vid,
      "user.name": username.toLowerCase(),
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong while searching for user",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Password encryption failed", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403
    );
    return next(error);
  }

  const info = {
    userId: existingUser.id,
    username: existingUser.user.name,
    vid: existingUser.user.vereniging,
    admin: existingUser.admin,
  };

  let token;
  try {
    token = jwt.sign(info, process.env.JWT_KEY, { expiresIn: "30m" });
  } catch (err) {
    const error = new HttpError("Creating web token failed", 500);
    return next(error);
  }

  res
    .status(200)
    .json({ userId: existingUser.id, token, admin: existingUser.admin });
};

module.exports = login;
