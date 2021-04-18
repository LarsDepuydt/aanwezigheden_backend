const express = require("express");
const { check } = require("express-validator");

const getVerenigingId = require("../controllers/vereniging/getVerenigingId");
const createVereniging = require("../controllers/vereniging/createVereniging");
const updateVereniging = require("../controllers/vereniging/updateVereniging");

const router = express.Router();

router.get(
  "/",
  [check("name").notEmpty().trim().escape().isString()],
  getVerenigingId
);

router.post(
  "/",
  [
    check("name").notEmpty().trim().escape().isString(),
    check("username").notEmpty().trim().escape().isString(),
    check("password")
      .notEmpty()
      .trim()
      .escape()
      .isString()
      .isLength({ min: 6 }),
  ],
  createVereniging
);

router.patch(
  "/",
  [check("name").notEmpty().trim().escape().isString()],
  updateVereniging
);

module.exports = router;
