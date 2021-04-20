const express = require("express");
const { check } = require("express-validator");

const checkAuth = require("../middleware/checkAuth");
const checkForId = require("../util/checkObjectIdArray");

const createUser = require("../controllers/user/createUser");
const loginUser = require("../controllers/user/loginUser");
const updateAanwezigheid = require("../controllers/user/updateAanwezigheid");

const router = express.Router();

router.post(
  "/:vname/signup",
  [
    check("username").notEmpty().trim().escape().isString(),
    check("password")
      .notEmpty()
      .trim()
      .escape()
      .isString()
      .isLength({ min: 6 }),
    check("geboortejaar").optional().isNumeric().isLength({ min: 4, max: 4 }),
  ],
  createUser
);

router.patch(
  "/:vname/login",
  [
    check("username").notEmpty().trim().escape().isString(),
    check("password")
      .notEmpty()
      .trim()
      .escape()
      .isString()
      .isLength({ min: 6 }),
  ],
  loginUser
);

router.use(checkAuth);

router.patch(
  "/",
  [
    check("aanwezig")
      .optional()
      .custom((val) => checkForId(val)),
    check("afwezig")
      .optional()
      .custom((val) => checkForId(val)),
    check("onbepaald")
      .optional()
      .custom((val) => checkForId(val)),
  ],
  updateAanwezigheid
);

module.exports = router;
