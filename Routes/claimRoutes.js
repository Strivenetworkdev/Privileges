const express = require("express");
const router = express.Router();

const privilegeController = require("../Controllers/privilegeController");
const claimController = require("../Controllers/claimController")

// Route to transfer a claimed privilege
router.post("/transfer", claimController.transferPrivilege);

// Route to redeem a privilege
router.post("/redeem", claimController.redeemPrivilege);

module.exports = router;
