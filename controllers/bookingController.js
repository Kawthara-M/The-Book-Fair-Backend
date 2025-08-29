const Fair = require("../models/Fair")
const Hall = require("../models/Hall")
const Exhibitor = require("../models/Exhibitor")
const Booking = require("../models/Booking")

const createBooking = async (req, res) => {
  const fair = await Fair.findById(req.params.fairId)

  if (!fair) {
    return res.status(404).send("Fair not found!")
  }

  const {exhibitorRole, stands} = req.body
try{

} catch(error){
  
}
}

module.exports = {
  createBooking,
  getBookings,
  getBookingByFair,
  getBookingByUser,
  updateBooking,
  updateStatus,
  deleteBooking,
}
