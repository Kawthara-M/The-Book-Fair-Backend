const router = require("express").Router()
const authCtrl = require("../controllers/authController")
const middleware = require("../middleware")
const upload = require("../config/multer")

router.post("/sign-up", upload.single("portfolio"), authCtrl.SignUp)
router.post("/sign-in", authCtrl.SignIn)

router.put(
  "/update-password",
  middleware.stripToken,
  middleware.verifyToken,
  authCtrl.UpdatePassword
)

router.delete(
  "/",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAttendee,
  authCtrl.deleteAccount
)

router.get(
  "/session",
  middleware.stripToken,
  middleware.verifyToken,
  authCtrl.CheckSession
)
module.exports = router
