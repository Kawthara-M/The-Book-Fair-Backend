const mongoose = require("mongoose")
const Schema = mongoose.Schema

const HallSchema = new Schema(
  {
    fair: {
      type: Schema.Types.ObjectId,
      ref: "Fair",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },

    stands: [
      {
        type: {
          type: String,
        },
        fee: {
          type: Number,
        },
        availability: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Hall", HallSchema)
