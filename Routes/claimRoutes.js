const express = require("express");
const router = express.Router();

const privilegeController = require("../Controllers/privilegeController");

// Route to transfer a claimed privilege
router.post("/transfer", privilegeController.transferPrivilege);

// Route to redeem a privilege
router.post("/redeem", privilegeController.redeemPrivilege);

module.exports = router;
