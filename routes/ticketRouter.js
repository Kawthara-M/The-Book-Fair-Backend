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

// might be deleted
router.get(
  "/:fairId",
  middleware.stripToken,
  middleware.verifyToken,
  ticketCtrl.getTicketsByFair
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

// should user be able to delete the ticket? they would need to refund them,
router.delete(
  "/:ticketId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAttendee,
  ticketCtrl.deleteTicket
)

module.exports = router
