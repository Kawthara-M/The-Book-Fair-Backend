const mongoose = require("mongoose")
const Schema = mongoose.Schema

const TicketSchema = new Schema(
  {
    fair: {
      type: Schema.Types.ObjectId,
      ref: "Fair",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "expired"],
    }
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Ticket", TicketSchema)
