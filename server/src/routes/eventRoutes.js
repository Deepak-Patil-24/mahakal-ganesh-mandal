const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Event routes working!" });
});

module.exports = router;
