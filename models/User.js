const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    passwordDigest: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required:true,
      enum:['Admin', 'Attendee', 'Exhibitor']
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)
