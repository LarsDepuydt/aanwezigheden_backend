const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const vereniging = new Schema({
  name: { type: String, required: true, unique: true },
  users: [{ type: mongoose.Types.ObjectId, ref: "User", default: [] }],
  events: [{ type: mongoose.Types.ObjectId, ref: "Event", default: [] }],
});

vereniging.plugin(uniqueValidator, { message: "Error in vereniging schema" });

module.exports = mongoose.model("Vereniging", vereniging);
