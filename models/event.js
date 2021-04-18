const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const event = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  vereniging: { type: mongoose.Types.ObjectId, ref: "Vereniging" },
  aanwezig: [{ type: mongoose.Types.ObjectId, ref: "User", default: [] }],
  afwezig: [{ type: mongoose.Types.ObjectId, ref: "User", default: [] }],
  onbepaald: [{ type: mongoose.Types.ObjectId, ref: "User", default: [] }],
});

event.plugin(uniqueValidator, { message: "Error in event schema" });

module.exports = mongoose.model("Event", event);
