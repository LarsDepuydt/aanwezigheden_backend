const express = require("express");
const { check } = require("express-validator");

const createEvent = require("../controllers/event/createEvent");
const getEvents = require("../controllers/event/getEvents");
const getOneEvent = require("../controllers/event/getOneEvent");
const updateEvent = require("../controllers/event/updateEvent");
const deleteEvent = require("../controllers/event/deleteEvent");
const getAanwezighedenEvent = require("../controllers/event/getAanwezighedenEvent");

const router = express.Router();

router.post(
  "/",
  [
    check("name").notEmpty().trim().escape().isString(),
    check("date").notEmpty().isISO8601(),
  ],
  createEvent
);

router.get("/", getEvents);

router.get("/:id", getOneEvent);

router.get("/aanwezigheden/:id", getAanwezighedenEvent);

router.patch(
  "/:id",
  [
    check("name").optional().trim().escape().isString(),
    check("date").optional().isISO8601(),
  ],
  updateEvent
);

router.delete("/:id", deleteEvent);

module.exports = router;
