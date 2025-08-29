const mongoose = require("mongoose")
const Schema = mongoose.Schema

const FairSchema = new Schema(
  {
    mainManager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "upcoming",
      enum: ["upcoming", "openForBooking", "ongoing", "finished", "canceled"],
    },
    exhibitorRoles: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: "",
        },
        standsLimit: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    tickets: [
      {
        type: {
          type: String,
        },
        fee: {
          type: Number,
        },
        entryTime: {
          type: String,
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        availability: {
          type: Number,
        }, 
        startDate: {
          type: String,
          required: true,
        },
        endDate: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Fair", FairSchema)
