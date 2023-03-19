const express = require("express");
const router = express.Router();

const privilegeController = require("../controllers/privilegeController");

// Route to create a new privilege
router.post("/", privilegeController.createPrivilege);

// Route to claim a privilege
router.post("/:privilege_id/claim", privilegeController.claimPrivilege);

// Route to transfer a privilege
router.post("/:claim_id/transfer", privilegeController.transferPrivilege);

// Returning the created privileges to the user as per the wallet address
router.get("/:wallet_address", privilegeController.getCreatedPrivileges);

module.exports = router;
