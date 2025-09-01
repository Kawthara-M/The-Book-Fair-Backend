const Ticket = require("../models/Ticket")
const Fair = require("../models/Fair")

// tested!, this is to simulate attendee buying ticket
const createTicket = async (req, res) => {
  try {
    const fair = await Fair.findById(req.params.fairId)

    if (!fair) {
      return res.status(404).send("Fair not found!")
    }

    const { type } = req.body

    const ticketIndex = fair.tickets.findIndex((ticket) => ticket.type === type)
    if (ticketIndex === -1) {
      return res
        .status(400)
        .json({ error: "Invalid ticket type for this fair" })
    }

    if (fair.tickets[ticketIndex].availability <= 0) {
      return res.status(400).json({ error: "No tickets available!" })
    }
    let statusBasedOnFee = "active"
    if (fair.tickets[ticketIndex].fee > 0) {
      statusBasedOnFee = "unpaid"
    }

    const newTicket = await Ticket.create({
      fair: fair._id,
      user: res.locals.payload.id,
      type,
      status: statusBasedOnFee,
    })

    fair.tickets[ticketIndex].availability -= 1
    await fair.save()

    res.status(201).json(newTicket)
  } catch (error) {
    throw error
  }
}

const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params
    const { newType } = req.body

    let ticket = await Ticket.findById(ticketId).populate("fair")
    if (ticket && ticket.status == "unpaid") {
      const fair = ticket.fair
      let fairTickets = fair.tickets

      let typeIndex = fairTickets.findIndex(
        (fairTicket) => fairTicket.type === newType
      )

      if (typeIndex >= 0) {
        let updateAvailability = true
        if (fairTickets[typeIndex].type == ticket.type) {
          updateAvailability = false
        }
        const ticketStartDate = new Date(fairTickets[typeIndex].startDate)
        const now = new Date()

        if (fairTickets[typeIndex].availability > 0 && ticketStartDate > now) {
          const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            { status: "unpaid", type: newType },
            { new: true }
          )
          if (!updatedTicket) {
            return res.status(404).json({ error: "Ticket not found" })
          }
          if (updateAvailability) {
            fairTickets[typeIndex].availability -= 1
            await fair.save()
          }

          return res.status(200).json(updatedTicket)
        } else {
          return res
            .status(400)
            .json({ error: "Ticket type unavailable or not started yet" })
        }
      } else {
        return res
          .status(400)
          .json({ error: "Invalid ticket type for this fair" })
      }
    } else {
      res.status(403).send({
        msg: "You are not authorized to update a ticket that has been paid!",
      })
    }

    // if (fair.tickets[ticketIndex].availability <= 0) {
    //   return res.status(400).json({ error: "No tickets available!" })
    // }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update ticket!" })
  }
}

// tested!
const updateStatus = async (req, res) => {
  try {
    const { ticketId } = req.params
    const ticket = await Ticket.findById(ticketId)
    const stages = ["unpaid", "active", "expired"]

    if (ticket) {
      if (ticket.user != res.locals.payload.id) {
        res.status(403).send({
          msg: "You are not authorized to update status of a ticket you do not own!",
        })
      }

      const index = stages.findIndex((stage) => stage === ticket.status)
      if (index >= 0 && index < stages.length - 1) {
        ticket.status = stages[index + 1]
        await ticket.save()
        return res
          .status(200)
          .json({ msg: "Ticket status updated successfully.", ticket })
      } else {
        res.status(403).send({
          msg: "You are not authorized to update a ticket in this status!",
        })
      }
    } else {
      return res.status(404).json({ error: "Ticket not found!" })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to update ticket status." })
  }
}

// tested!
const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params
    let ticket = await Ticket.findById(ticketId).populate("fair")

    if (ticket) {
      const fair = ticket.fair

      const ticketToUpdate = fair.tickets.find((t) => t.type === ticket.type)
      if (ticketToUpdate) {
        ticketToUpdate.availability += 1
        await fair.save()
      }

      await Ticket.findByIdAndDelete(ticketId)

      return res.status(200).json({ message: "Ticket deleted successfully." })
    } else {
      return res.status(404).json({ message: "Ticket not found." })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to delete fair." })
  }
}

//tested!
const getTicketsByUser = async (req, res) => {
  try {
    const userId = res.locals.payload.id
    const tickets = await Ticket.find({ user: userId }).populate("fair")

    if (tickets) {
      res.send(tickets)
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Failed to get Tickets!")
  }
}

// why do we even need this? tickets info can be extracted from fair
const getTicketsByFair = async (req, res) => {
  try {
    const fair = await Fair.findById(req.params.fairId)

    if (fair.tickets.length > 0) {
      res.send(fair.tickets)
    } else {
      res.status(404).send("No tickets found for this fair!")
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Failed to get Tickets!")
  }
}

module.exports = {
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketsByUser,
  getTicketsByFair,
  updateStatus,
}
