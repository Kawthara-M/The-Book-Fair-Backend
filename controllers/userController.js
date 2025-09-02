const User = require("../models/User")
const Exhibitor = require("../models/Exhibitor")

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(res.locals.payload.id)

    if (!user) {
      return res.status(404).send("User not found")
    }

    const exhibitor = await Exhibitor.findOne({ user: res.locals.payload.id })

    res.status(200).json({
      user,
      exhibitor: exhibitor || "",
    })
  } catch (error) {
    return res.status(500).json({
      error: "Failure encountred while fetching user profile."
    })
  }
}

// tested
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, job, cr } = req.body
    const userId = res.locals.payload.id

    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() })
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ error: "Email is already taken." })
      }
    }

    const portfolioUrl = req.file
      ? `/uploads/portfolio/${req.file.filename}`
      : null

    const userUpdateData = {}
    if (name) userUpdateData.name = name
    if (email) userUpdateData.email = email
    if (phone) userUpdateData.phone = phone

    const updatedUser = await User.findByIdAndUpdate(userId, userUpdateData, {
      new: true,
    })
    if (!updatedUser) {
      return res.status(404).send("User not found!")
    }

    const exhibitor = await Exhibitor.findOne({ user: userId })

    let updatedExhibitor = null

    if (exhibitor) {
      const exhibitorUpdateData = {}
      if (job) exhibitorUpdateData.job = job
      if (cr) exhibitorUpdateData.cr = cr
      if (portfolioUrl) exhibitorUpdateData.portfolio = portfolioUrl

      if (Object.keys(exhibitorUpdateData).length > 0) {
        updatedExhibitor = await Exhibitor.findByIdAndUpdate(
          exhibitor._id,
          exhibitorUpdateData,
          { new: true }
        )
        if (updatedExhibitor) {
          updatedExhibitor.save()
        } else {
          return res.status(500).json({ error: "Failed to update exhibitor." })
        }
      } else {
        updatedExhibitor = exhibitor
      }
    }

    res.status(200).json({
      user: updatedUser,
      exhibitor: updatedExhibitor,
    })
  } catch (error) {
      return res.status(500).json({
      error: "Failure encountred while updating user profile."
    })
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile,
}
