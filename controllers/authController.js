const User = require("../models/User")
const Exhibitor = require("../models/Exhibitor")
const Ticket = require("../models/Ticket")
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

// tested!
const deleteAccount = async (req, res) => {
  try {
    const userId = res.locals.payload.id

    const tickets = await Ticket.find({ user: userId })

    for (const ticket of tickets) {
      await Ticket.findByIdAndDelete(ticket._id)
    }

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

    if (user) {
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
      } else {
        res
          .status(401)
          .send({ status: "Error", msg: "Passwords did not match!" })
      }
    } else {
      return res.status(404).send("User not found!")
    }
  } catch (error) {
    console.log(error)
    res.status(401).send({
      status: "Error",
      msg: "An error has occurred updating password!",
    })
  }
}

// tested
const CheckSession = async (req, res) => {
  const { payload } = res.locals
  res.status(200).send(payload)
}

module.exports = {
  SignUp,
  SignIn,
  CheckSession,
  deleteAccount,
  UpdatePassword,
}
