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
  "/:fairId",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAttendee,
  ticketCtrl.getTicketsByUser
)

// what would attendee update?
// we can make them change type, but they would have to pay difference..., I might make a separate controller for that
router.put(
  "/:id",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAttendee,
  ticketCtrl.updateTicket
)

// should user be able to delete the ticket? they would need to refund them, I will leave it for later currently
router.delete(
  "/:id",
  middleware.stripToken,
  middleware.verifyToken,

  ticketCtrl.deleteTicket
)

module.exports = router
