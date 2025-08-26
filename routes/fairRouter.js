const express = require("express")
const router = express.Router()
const fairController = require("../controllers/fairController")
const middleware = require("../middleware")


router.get("/", fairController.getFairs)
router.get("/:id", fairController.getFairById)

router.post(
  "/",
  middleware.stripToken,
  middleware.verifyToken,
  fairController.createFair
)

router.put(
  "/:id",
  middleware.stripToken,
  middleware.verifyToken,
  fairController.updateFair
)

router.delete(
  "/:id",
  middleware.stripToken,
  middleware.verifyToken,
  fairController.deleteFair
)

module.exports = router
