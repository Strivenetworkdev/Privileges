const express = require("express");
const router = express.Router();

const privilegeController = require("../controllers/privilegeController");

// Route to create a new privilege
router.post("/", privilegeController.createPrivilege);

// Route to claim a privilege
router.post("/:privilege_id/claim", privilegeController.claimPrivilege);

// Route to transfer a privilege
router.post("/:claim_id/transfer", privilegeController.transferPrivilege);

module.exports = router;
