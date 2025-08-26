const User = require("../models/User")
const Exhibitor = require("../models/Exhibitor")

// should be tested again to assure it works with portfolio
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(res.locals.payload.id)

    if (!user) {
      return res.status(404).send("User not found")
    }

    const exhibitor = await Exhibitor.findOne({ user: res.locals.payload.id })

    res.status(200).json({
      user,
      exhibitor: exhibitor || null,
    })

    res.status(200).json(user)
  } catch (error) {
    throw error
  }
}

// not tested, should update it to cater for file
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, job, category } = req.body
    const userId = res.locals.payload.id

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
      return res.status(404).send("User not found")
    }

    const exhibitor = await Exhibitor.findOne({ user: userId })

    let updatedExhibitor = null

    if (exhibitor) {
      const exhibitorUpdateData = {}
      if (job) exhibitorUpdateData.job = job
      if (category) exhibitorUpdateData.category = category
      if (portfolioUrl) exhibitorUpdateData.portfolio = portfolioUrl

      if (Object.keys(exhibitorUpdateData).length > 0) {
        updatedExhibitor = await Exhibitor.findByIdAndUpdate(
          exhibitor._id,
          exhibitorUpdateData,
          { new: true }
        )
      } else {
        updatedExhibitor = exhibitor
      }
    }

    res.status(200).json({
      user: updatedUser,
      exhibitor: updatedExhibitor,
    })
  } catch (error) {
    throw error
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile,
}
