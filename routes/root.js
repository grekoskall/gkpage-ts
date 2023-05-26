const express = require('express')
const router = express.Router()
const path = require('path')

// ^ - at the beggining only, $ at the end only, | or, ()? optional
router.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router;