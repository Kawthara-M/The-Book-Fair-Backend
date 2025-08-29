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
// get all bookings
router.get(
  "/",
  middleware.stripToken,
  middleware.verifyToken,
  bookingCtrl.getBookings
)

router.get(
  "/:fairId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdmin,
  bookingCtrl.getBookingByFair
)
router.get(
  "/exhibitor-bookings/:fairId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isExhibitor,
  bookingCtrl.getBookingByUser
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
  middleware.isAttendee,
  bookingCtrl.deleteBooking
)

module.exports = router
