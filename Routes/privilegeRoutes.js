const express = require('express');
const router = express.Router();

const privilegeController = require('../controllers/privilegeController');

// Route to create a new privilege
router.post('/', privilegeController.createPrivilege);

// Route to claim a privilege
router.post('/:privilege_id/claim', privilegeController.claimPrivilege);


module.exports = router;