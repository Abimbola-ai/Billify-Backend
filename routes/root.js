const express = require('express')
const router = express.Router()
const path = require('path')

// Route with Regular expression pattern that matches the URL paths
// Matches the root url / or /index or /index.html
router.get('^/$|/index(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router
