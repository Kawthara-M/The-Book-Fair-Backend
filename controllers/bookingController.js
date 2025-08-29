const Fair = require("../models/Fair")
const Hall = require("../models/Hall")
const Exhibitor = require("../models/Exhibitor")
const Stand = require("../models/Stand")
const Booking = require("../models/Booking")

// tested!
const createBooking = async (req, res) => {
  try {
    const fair = await Fair.findById(req.params.fairId)
    if (!fair) {
      return res.status(404).send("Fair not found!")
    }

    const { exhibitorRole, stands } = req.body
    const userId = res.locals.payload.id
    const exhibitor = await Exhibitor.findOne({ user: userId }).populate("user")
    if (!exhibitor) {
      return res.status(404).json({ error: "Exhibitor not found!" })
    }
    const exhibitorId = exhibitor._id
    const exhibitorName = exhibitor.user.name

    const roleIndex = fair.exhibitorRoles.findIndex(
      (role) => role.name === exhibitorRole
    )
    if (roleIndex === -1) {
      return res
        .status(400)
        .json({ error: "Invalid exhibitor role for this fair!" })
    }

    if (fair.exhibitorRoles[roleIndex].standsLimit < stands.length) {
      return res
        .status(400)
        .json({ error: "You are exceeding this role stands limit!" })
    }

    const halls = await Hall.find({ fair: req.params.fairId })
    if (!halls || halls.length === 0) {
      return res.status(404).send("No Halls found for this fair!")
    }

    const errors = []
    const createdStands = []

    for (const standRequest of stands) {
      const requestedType = standRequest.requestedType
      const requestedCount = parseInt(standRequest.requestedCount) || 0
      let remaining = requestedCount

      for (const hall of halls) {
        const standIdx = hall.stands.findIndex(
          (s) => s.type === requestedType && s.availability > 0
        )

        while (
          standIdx !== -1 &&
          hall.stands[standIdx].availability > 0 &&
          remaining > 0
        ) {
          const standDoc = await Stand.create({
            hall: hall._id,
            name: `${exhibitorName} - ${hall.name} - ${requestedType}`,
            exhibitor: exhibitorId,
            type: requestedType,
          })
          console.log("error is here?")

          createdStands.push(standDoc._id)

          hall.stands[standIdx].availability -= 1
          remaining--

          if (hall.stands[standIdx].availability === 0) break
        }

        if (remaining === 0) break
      }

      if (remaining > 0) {
        return res.status(400).json({
          error: `Not enough availability for stand type '${requestedType}'.`,
        })
      }
    }

    for (const hall of halls) {
      await hall.save()
    }

    const booking = await Booking.create({
      fair: req.params.fairId,
      stands: createdStands,
      exhibitor: exhibitorId,
      exhibitorRole,
      status: "pending",
    })

    if (booking) {
      return res.status(200).json({
        message: "Booking placed successfully!",
        booking,
      })
    } else {
      return res.status(400).json({
        error: "Failed to place booking.",
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Failed to create booking!")
  }
}

// I think this one should be deleted
const getBookings = async (req, res) => {
  try {
    // const userId = res.locals.payload.id
    // const tickets = await Ticket.find({ user: userId }).populate("fair")
    // if (tickets) {
    //   res.send(tickets)
    // }
  } catch (error) {
    console.error(error)
    res.status(500).send("Failed to get Bookings!")
  }
}

//tested
const getBookingsByFair = async (req, res) => {
  try {
    const adminId = res.locals.payload.id
    const fair = await Fair.findOne({
      _id: req.params.fairId,
      mainManager: adminId,
    })

    if (fair) {
      const bookings = await Booking.find({ fair: fair }).populate('exhibitor')

      if (bookings) {
        res.send(bookings)
      } else {
        return res.status(404).send("No Bookings found for this fair!")
      }
    } else {
      res.status(403).send({
        msg: "You are not authorized to view bookings of a fair you don't manage!",
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Failed to get Bookings!")
  }
}

// tested
const getBookingsByUser = async (req, res) => {
  try {
    const userId = res.locals.payload.id
    const exhibitor = await Exhibitor.findOne({user:userId})
    const exhibitorId = exhibitor._id
    const bookings = await Booking.find({ exhibitor: exhibitorId })

    if (bookings) {
      res.send(bookings)
    } else {
      return res.status(404).send("No Bookings found for this exhibitor!")
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Failed to get Bookings!")
  }
}

//tested
const updateBooking = async (req, res) => {
  try {
    const userId = res.locals.payload.id
    const { bookingId } = req.params
    const { stands: newStands } = req.body

    const exhibitor = await Exhibitor.findOne({ user: userId }).populate("user")
    if (!exhibitor) {
      return res.status(404).json({ error: "Exhibitor not found!" })
    }

    const booking = await Booking.findById(bookingId)
      .populate("stands")
      .populate("fair")
    if (!booking) {
      return res.status(404).json({ error: "Booking not found!" })
    }

    if (!booking.exhibitor.equals(exhibitor._id)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this booking." })
    }

    if (booking.status != "pending") {
      return res
        .status(403)
        .json({ error: "Unauthorized to update a booking past pending stage" })
    }

    if (
      req.body.exhibitorRole &&
      req.body.exhibitorRole !== booking.exhibitorRole
    ) {
      return res.status(400).json({ error: "Cannot change exhibitor role." })
    }

    const fair = booking.fair
    const halls = await Hall.find({ fair: booking.fair })

    if (!halls.length) {
      return res.status(404).json({ error: "No halls found for this fair!" })
    }

    const role = fair.exhibitorRoles.find(
      (r) => r.name === booking.exhibitorRole
    )
    if (!role) {
      return res
        .status(400)
        .json({ error: "Exhibitor role not valid for this fair!" })
    }

    if (newStands.length > role.standsLimit) {
      return res
        .status(400)
        .json({ error: "Exceeds stand limit for this role!" })
    }

    for (const stand of booking.stands) {
      const hall = await Hall.findById(stand.hall)
      const hallStandType = hall.stands.find((s) => s.type === stand.type)
      if (hallStandType) {
        hallStandType.availability += 1
        await hall.save()
      }
      await Stand.findByIdAndDelete(stand._id)
    }

    const createdStands = []

    for (const request of newStands) {
      const { requestedType, requestedCount } = request
      let count = parseInt(requestedCount) || 0

      for (const hall of halls) {
        const idx = hall.stands.findIndex(
          (s) => s.type === requestedType && s.availability > 0
        )

        while (idx !== -1 && hall.stands[idx].availability > 0 && count > 0) {
          const stand = await Stand.create({
            hall: hall._id,
            name: `${exhibitor.user.name} - ${hall.name} - ${requestedType}`,
            exhibitor: exhibitor._id,
            type: requestedType,
          })

          createdStands.push(stand._id)
          hall.stands[idx].availability -= 1
          count--

          if (hall.stands[idx].availability === 0) break
        }

        if (count === 0) break
      }

      if (count > 0) {
        return res.status(400).json({
          error: `Not enough availability for '${requestedType}' stands.`,
        })
      }
    }

    for (const hall of halls) {
      await hall.save()
    }

    booking.stands = createdStands
    await booking.save()

    return res.status(200).json({
      message: "Booking updated successfully.",
      booking,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to update booking." })
  }
}

//tested
const updateStatus = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { status } = req.body

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update." })
    }

    const booking = await Booking.findById(bookingId).populate("stands")
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." })
    }

    const currentUserId = res.locals.payload.id

    const fair = await Fair.findById(booking.fair)

    const isMainManager = fair && fair.mainManager.equals(currentUserId)

    if (!isMainManager) {
      return res.status(403).json({
        error: "You are not authorized to update the booking status.",
      })
    }

    if (status === "rejected") {
      for (const standId of booking.stands) {
        const stand = await Stand.findById(standId)
        if (stand) {
          const hall = await Hall.findById(stand.hall)
          if (hall) {
            const hallStand = hall.stands.find((s) => s.type === stand.type)
            if (hallStand) {
              hallStand.availability += 1
              await hall.save()
            }
          }
          await Stand.findByIdAndDelete(stand._id)
        }
      }

      booking.stands = []
    }

    booking.status = status
    await booking.save()

    return res
      .status(200)
      .json({ message: `Booking status updated to ${status}`, booking })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to update booking status." })
  }
}

//tested
const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params
    const booking = await Booking.findById(bookingId).populate("exhibitor")

    if (booking) {
      if (booking.exhibitor.user != res.locals.payload.id) {
        res.status(403).send({
          msg: "You are not authorized to delete a booking you did not place!",
        })
      }
      if (booking.status === "pending") {
        for (const standId of booking.stands) {
          const stand = await Stand.findById(standId)
          if (stand) {
            const hall = await Hall.findById(stand.hall)
            if (hall) {
              const hallStand = hall.stands.find((s) => s.type === stand.type)
              if (hallStand) {
                hallStand.availability += 1
                await hall.save()
              }
            }
            await Stand.findByIdAndDelete(stand._id)
          }
        }

        await Booking.findByIdAndDelete(bookingId)

        return res
          .status(200)
          .json({ message: "Booking deleted successfully." })
      } else {
        res.status(403).send({
          msg: "You are not authorized to delete a booking that is past the pending stage",
        })
      }
    } else {
      return res.status(404).json({ error: "Booking not found!" })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to delete booking." })
  }
}

module.exports = {
  createBooking,
  getBookings,
  getBookingsByFair,
  getBookingsByUser,
  updateBooking,
  updateStatus,
  deleteBooking,
}
