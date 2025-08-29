const mongoose = require("mongoose")
const Schema = mongoose.Schema

const StandSchema = new Schema(
  {
    hall: {
      type: Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
    },
    name: {
      type: String,
    },
    exhibitor: {
      type: Schema.Types.ObjectId,
      ref: "Exhibitor",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Stand", StandSchema)
