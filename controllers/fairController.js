const Fair = require("../models/Fair")
const Hall = require("../models/Hall")

// tested
const getFairs = async (req, res) => {
  try {
    const fairs = await Fair.find().populate("mainManager")
    res.send(fairs)
  } catch (error) {
    console.error("Failed to fetch fairs!", error.message)
  }
}

// tested
const getFairById = async (req, res) => {
  try {
    const { id } = req.params
    const fair = await Fair.findOne({ _id: id }).populate("mainManager")

    if (fair) {
      res.send(fair)
    } else {
      res.send("no such fair found!")
    }
  } catch (error) {
    console.log(error)
  }
}

const isTicketDateRangeValid = (fairStartDate, fairEndDate, tickets) => {
  const minDate = new Date(fairStartDate)
  const maxDate = new Date(fairEndDate)

  return tickets.every((ticket) => {
    const start = new Date(ticket.startDate)
    const end = new Date(ticket.endDate)
    return start >= minDate && end <= maxDate
  })
}

const calculateHallsStands = (halls) => {
  let totalStandsAvailability = 0
  halls.forEach((hall) => {
    hall.stands.forEach((stand) => {
      totalStandsAvailability += stand.availability || 0
    })
  })
  return totalStandsAvailability
}
const calculateStandsLimit = (roles) => {
  let totalStandsLimit = 0
  roles.forEach((role) => {
    totalStandsLimit += role.standsLimit || 0
  })

  return totalStandsLimit
}

// tested
const createFair = async (req, res) => {
  try {
    const {
      name,
      address,
      description,
      status,
      exhibitorRoles,
      tickets,
      halls,
      startDate,
      endDate,
    } = req.body
    if (!Array.isArray(halls) || !Array.isArray(exhibitorRoles)) {
      return res
        .status(400)
        .json({ error: "Halls and exhibitorRoles must be arrays" })
    }

    if (!isTicketDateRangeValid(startDate, endDate, tickets)) {
      return res.status(400).json({
        error:
          "Ticket startDate and endDate must fall within the fair's startDate and endDate",
      })
    }

    let fair = await Fair.findOne({
      name: name,
    })

    if (fair) {
      return res
        .status(409)
        .json({ error: "A fair with this name already exists!" })
    } else {
      if (calculateHallsStands(halls) > calculateStandsLimit(exhibitorRoles)) {
        fair = await Fair.create({
          name,
          address,
          description,
          status,
          exhibitorRoles,
          mainManager: res.locals.payload.id,
          tickets,
          startDate,
          endDate,
        })

        for (const hall of halls) {
          await Hall.create({
            fair: fair._id,
            name: hall.name,
            stands: hall.stands,
          })
        }

        return res.status(201).json(fair)
      } else {
        return res
          .status(400)
          .send(
            "Stands limit shouldn't exceed the total available stands for this fair!"
          )
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create fair" })
  }
}

// should be tested
const updateFair = async (req, res) => {
  try {
    const { id } = req.params
    const { ticket, exhibitorRole, ...otherFields } = req.body

    const fair = await Fair.findById(id)
    if (!fair) {
      return res.status(404).json({ error: "Fair not found!" })
    }

    Object.keys(otherFields).forEach((key) => {
      fair[key] = otherFields[key]
    })

    if (ticket && ticket.type) {
      const index = fair.tickets.findIndex((t) => t.type === ticket.type)
      if (index >= 0) {
        fair.tickets[index] = { ...fair.tickets[index], ...ticket }
      } else {
        fair.tickets.push(ticket)
      }
    }

    if (exhibitorRole && exhibitorRole.name) {
      const index = fair.exhibitorRoles.findIndex(
        (r) => r.name === exhibitorRole.name
      )
      if (index >= 0) {
        fair.exhibitorRoles[index] = {
          ...fair.exhibitorRoles[index],
          ...exhibitorRole,
        }
      } else {
        fair.exhibitorRoles.push(exhibitorRole)
      }
    }

    await fair.save()

    return res.status(200).json(fair)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to update fair" })
  }
}

//tested
const cancelFair = async (req, res) => {
  try {
    console.log("here")
    const { id } = req.params
    console.log(id)
    const fair = await Fair.findById(id)
    console.log("here")

    if (fair) {
      if (fair.mainManager != res.locals.payload.id) {
        res.status(403).send({
          msg: "You are not authorized to cancel a fair you do not manage!",
        })
      }
      if (fair.status != "openForBooking") {
        console.log("reached if")
        const cancelFair = await Fair.findByIdAndUpdate(id, {
          status: "canceled",
        })

        return res.status(200).json({ message: "Fair canceled successfully." })
      } else {
        res.status(403).send({
          msg: "You are not authorized to cancel this fair!",
        })
      }
    } else {
      console.log("Iam in this else")
      return res.status(404).json({ error: "Fair not found!" })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to cancel fair." })
  }
}

// tested!
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const fair = await Fair.findById(id)
    const stages = ["upcoming", "openForBooking", "ongoing", "finished"]

    if (fair) {
      if (fair.mainManager != res.locals.payload.id) {
        res.status(403).send({
          msg: "You are not authorized to update status of a fair you do not manage!",
        })
      }

      const index = stages.findIndex((stage) => stage === fair.status)
      if (index >= 0 && index < stages.length - 1) {
        fair.status = stages[index + 1]
        await fair.save()
        return res
          .status(200)
          .json({ msg: "Fair stage updated successfully.", fair })
      } else {
        res.status(403).send({
          msg: "You are not authorized to update a fair in this status!",
        })
      }
    } else {
      return res.status(404).json({ error: "Fair not found!" })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to update fair status." })
  }
}
//tested
const deleteFair = async (req, res) => {
  try {
    const { id } = req.params
    const fair = await Fair.findById(id)
    if (fair) {
      if (fair.mainManager != res.locals.payload.id) {
        res.status(403).send({
          msg: "You are not authorized to delete a fair you do not manage!",
        })
      }
      if (fair.status === "upcoming") {
        const deletedFair = await Fair.findByIdAndDelete(id)

        return res.status(200).json({ message: "Fair deleted successfully." })
      } else {
        res.status(403).send({
          msg: "You are not authorized to delete a fair that is past the upcoming stage",
        })
      }
    } else {
      return res.status(404).json({ error: "Fair not found!" })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to delete fair." })
  }
}

const getHallsForFair = async (req, res) => {
  try {
    const { id } = req.params
    const halls = await Hall.find({ fair: id })
    res.status(200).json(halls)
  } catch (error) {
    console.error("Failed to fetch halls for fair", error)
    res.status(500).json({ error: "Could not fetch halls" })
  }
}

module.exports = {
  getFairs,
  getFairById,
  createFair,
  updateFair,
  deleteFair,
  cancelFair,
  updateStatus,
  getHallsForFair,
}
