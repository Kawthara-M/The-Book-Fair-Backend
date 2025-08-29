const mongoose = require("mongoose")
const Schema = mongoose.Schema

const BookingSchema = new Schema(
  {
    fair: {
      type: Schema.Types.ObjectId,
      ref: "Fair",
      required: true,
    },
    stands: [
      {
        type: Schema.Types.ObjectId,
        ref: "Stand",
      },
    ],

    exhibitor: {
      type: Schema.Types.ObjectId,
      ref: "Exhibitor",
      required: true,
    },
    exhibitorRole: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "paid", "rejected", "over"],
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Booking", BookingSchema)
