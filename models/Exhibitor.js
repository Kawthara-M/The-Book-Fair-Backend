const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ExhibitorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    cr: {
      type: String,
      default: "",
    },
    job: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "", //let's delete this one later
    },
    portfolio: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Exhibitor", ExhibitorSchema)
