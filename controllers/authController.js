const User = require("../models/User")
const Exhibitor = require("../models/Exhibitor")
const middleware = require("../middleware/index.js")
const validatePassword = require("../validators/passwordValidator.js")

// Tested!
const SignUp = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      cr,
      job,
      category,
    } = req.body

    const portfolioFile = req.file
      ? `/uploads/portfolio/${req.file.filename}`
      : null

    let existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({ error: "A user with this email exists!" })
    } else {
      if (!validatePassword(password)) {
        return res.status(400).json({
          error:
            "Weak Password! Have a mix of -lower & upper- case letters, digits, and unique symbols!",
        })
      } else {
        if (password === confirmPassword) {
          let hashPassword = await middleware.hashPassword(password)
          const user = await User.create({
            name,
            email,
            phone,
            role,
            passwordDigest: hashPassword,
          })

          if (role === "Exhibitor") {
            await Exhibitor.create({
              user: user._id,
              cr: cr || "",
              job: job || "",
              category: category || "",
              portfolio: portfolioFile,
            })
          }

          let payload = {
            id: user._id,
            email: user.email,
            role: user.role,
          }

          let token = middleware.createToken(payload)

          return res.send({ user: payload, token })
        } else {
          return res.status(400).json({
            error: "Passwords must match!",
          })
        }
      }
    }
  } catch (error) {
    throw error
  }
}

// Tested!
const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user) {
      let matched = await middleware.comparePassword(
        password,
        user.passwordDigest
      )
      if (matched) {
        let payload = {
          id: user._id,
          email: user.email,
          role: user.role,
        }
        let token = middleware.createToken(payload)
        return res.send({ user: payload, token })
      } else {
        return res
          .status(401)
          .send({ status: "Error", msg: "Invalid Credentials" })
      }
    } else {
      res.status(401).send({ status: "Error", msg: "Invalid Credentials" })
    }
  } catch (error) {
    console.log(error)
    res.status(401).send({ status: "Error", msg: "Invalid Credentials!" })
  }
}

const deletAccount = async (req, res) => {
  try {
    const userId = req.params.id

    if (res.locals.payload.id !== userId) {
      return res.status(403).send({ msg: "Unauthorized request" })
    }

    // await Order.deleteMany({ customer: userId }) // make this one delete tickets for Attendee, another for fairs when admin is deleted? and Booking when exhibitor is deleted
    await User.findByIdAndDelete(userId)

    res.status(200).send({ msg: "Account successfully deleted" })
  } catch (error) {
    console.error(error)
    res.status(500).send({ msg: "Failed to delete account" })
  }
}


// Tested!
const UpdatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    let user = await User.findById(res.locals.payload.id)
    let matched = await middleware.comparePassword(
      oldPassword,
      user.passwordDigest
    )
    if (matched) {
      if (!validatePassword(newPassword)) {
        return res.status(400).json({
          error:
            "Weak Password! Have a mix of capital and lower letters, digits, and unique symbols!",
        })
      }
      let passwordDigest = await middleware.hashPassword(newPassword)
      user = await User.findByIdAndUpdate(res.locals.payload.id, {
        passwordDigest,
      })
      let payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      }
      return res
        .status(200)
        .send({ status: "Password Updated!", user: payload })
    }
    res
      .status(401)
      .send({ status: "Error", msg: "Old Password did not match!" })
  } catch (error) {
    console.log(error)
    res.status(401).send({
      status: "Error",
      msg: "An error has occurred updating password!",
    })
  }
}

const CheckSession = async (req, res) => {
  const { payload } = res.locals
  res.status(200).send(payload)
}

module.exports = {
  SignUp,
  SignIn,
  CheckSession,
  deletAccount,
  UpdatePassword,
}
