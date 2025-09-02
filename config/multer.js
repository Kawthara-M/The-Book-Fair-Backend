const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const targetFolder = req.uploadFolder || "portfolio"

    const uploadDir = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      targetFolder
    )
    fs.mkdirSync(uploadDir, { recursive: true })

    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname
    cb(null, uniqueSuffix)
  },
})

const upload = multer({ storage })

module.exports = upload
