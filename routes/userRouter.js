const router = require('express').Router()
const userCtrl = require('../controllers/userController')
const middleware = require('../middleware')
const upload = require('../config/multer')


router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  userCtrl.getUserProfile
)

router.put(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  upload.single('portfolio'),
  userCtrl.updateUserProfile
)


module.exports = router