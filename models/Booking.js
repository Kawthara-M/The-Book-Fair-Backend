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
        type: {
          type: String,
        },
        number: {
          type: number,
        },
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
    hall: {
      type: Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
    },
    status: {
      type: String,
      default: "pendingg",
      enum: ["pending", "accepted", "rejected", "over"],
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Booking", BookingSchema)
