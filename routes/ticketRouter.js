const router = require("express").Router()
const ticketCtrl = require("../controllers/ticketController")
const middleware = require("../middleware")

router.post(
  "/:fairId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAttendee,
  ticketCtrl.createTicket
)
router.get(
  "/",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAttendee,
  ticketCtrl.getTicketsByUser
)

router.put(
  "/:ticketId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAttendee,
  ticketCtrl.updateTicket
)
router.put(
  "/update-status/:ticketId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAttendee,
  ticketCtrl.updateStatus
)

// no refund
router.delete(
  "/:ticketId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAttendee,
  ticketCtrl.deleteTicket
)

module.exports = router
