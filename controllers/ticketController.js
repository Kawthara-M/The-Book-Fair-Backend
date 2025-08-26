const Ticket = require("../models/Ticket")
const Fair = require("../models/Fair")

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

    if (fair.tickets[ticketIndex].availabilityPerDay <= 0) {
      return res.status(400).json({ error: "No tickets available!" })
    }

    const newTicket = await Ticket.create({
      fair: fair._id,
      user: res.locals.payload.id,
      type,
      status: "active",
    })

    fair.tickets[ticketIndex].availabilityPerDay -= 1
    await fair.save()

    res.status(201).json(newTicket)
  } catch (error) {
    throw error
  }
}
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found" })
    }

    res.status(200).json(updatedTicket)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update ticket!" })
  }
}

const deleteTicket = async (req, res) => {
  try {
    //until we figure out if deleting is possible or not
  } catch (error) {
    console.error(error)
    res.status(500).send("Failed to delete Ticket!")
  }
}
const getTicketsByUser = async (req, res) => {
  try {
    const userId = res.locals.payload.id
    const tickets = await Ticket.find({ user: userId }).populate("fair")

    if (tickets.length > 0) {
      res.send(tickets)
    } else {
      res.status(404).send("No tickets found for this user!")
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
}
