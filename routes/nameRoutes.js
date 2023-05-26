const express = require('express')
const router = express.Router()
const namesController = require('../controllers/namesController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(namesController.getAllNames)
    .post(namesController.createNewName)
    .patch(namesController.updateName)
    .delete(namesController.deleteName)

module.exports = router