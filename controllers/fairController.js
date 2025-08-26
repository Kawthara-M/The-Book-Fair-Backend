const Fair = require("../models/Fair")

const getFairs = async (req, res) => {
  try {
    const fairs = await Fair.find().populate("mainManager")
    res.send(fairs)
  } catch (error) {
    console.error("Failed to fetch fairs!", error.message)
  }
}

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

const createFair = async (req, res) => {
  try {
    const {
      name,
      address,
      description,
      category,
      activeDates,
      status,
      exhibitorRoles,
      mainManager,
      tickets,
    } = req.body

    let fair = await Fair.findOne({
      name: name,
    })
    if (fair) {
      res.send("A fair with this name exists!")
    } else {
      fair = await Fair.create({
        name,
        address,
        description,
        category,
        activeDates,
        status,
        mainManager,
        exhibitorRoles,
        tickets,
      })

      return res.status(201).json(fair)
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create fair" })
  }
}

const updateFair = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedFair = await Fair.findByIdAndUpdate(id, updateData, {
      new: true,
    })

    if (!updatedFair) {
      return res.status(404).json({ error: "Fair not found!" })
    }

    res.status(200).json(updatedFair)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update fair" })
  }
}

// this one should be updated when tickets and stands are created later
const deleteFair = async (req, res) => {
  try {
    const { id } = req.params
    const deletedFair = await Fair.findByIdAndDelete(id)

    if (!deletedFair) {
      return res.status(404).json({ message: "Fair not found." })
    }

    return res.status(200).json({ message: "Fair deleted successfully." })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to delete fair." })
  }
}

module.exports = {
  getFairs,
  getFairById,
  createFair,
  updateFair,
  deleteFair,
}
