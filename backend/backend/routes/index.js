const express = require ('express')
const router = express.Router()

router.get('/api', (req, res) => {
    res.render('index')
})

module.exports = router