const router = require("express").Router()
const bookingCtrl = require("../controllers/bookingController")
const middleware = require("../middleware")

router.post(
  "/:fairId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isExhibitor,
  bookingCtrl.createBooking
)
// get all bookings, but admin would be able to see all bookings even if they not manager, not right
router.get(
  "/exhibitor-bookings",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isExhibitor,
  bookingCtrl.getBookingsByUser
)

router.get(
  "/:fairId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdmin,
  bookingCtrl.getBookingsByFair
)
router.get(
  "/:bookingId/stands",
  middleware.stripToken,
  middleware.verifyToken,
  bookingCtrl.getBookingStands
)

router.put(
  "/:bookingId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isExhibitor,
  bookingCtrl.updateBooking
)

router.put(
  "/update-status/:bookingId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdmin,
  bookingCtrl.updateStatus
)

router.delete(
  "/:bookingId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isExhibitor,
  bookingCtrl.deleteBooking
)

module.exports = router
