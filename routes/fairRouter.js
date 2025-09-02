const express = require("express")
const router = express.Router()
const fairController = require("../controllers/fairController")
const middleware = require("../middleware")
const upload = require("../config/multer")

router.get("/", fairController.getFairs)
router.get(
  "/:id/halls",
  middleware.stripToken,
  middleware.verifyToken,
  fairController.getHallsForFair
)
router.get("/:id", fairController.getFairById)

// only admin can create, update, and delete fairs
router.post(
  "/",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdmin,
  fairController.createFair
)

router.put(
  "/:id",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdmin,
  fairController.updateFair
)
router.put(
  "/cancel-fair/:id",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdmin,
  fairController.cancelFair
)
router.put(
  "/update-status/:id",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdmin,
  fairController.updateStatus
)


router.delete(
  "/:id",
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdmin,
  fairController.deleteFair
)

module.exports = router
