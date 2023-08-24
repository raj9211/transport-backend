const express = require("express");
const router = express.Router();
const authGuard = require("../middleware/authGuard");
const userController = require("../controllers/users");

router.post("/create", userController.create);
router.post("/userLogin", userController.userLogin);
router.get("/getUsers", userController.getUsers);
router.get("/getUsersByAggregate", userController.aggregateFunctionTesting);


module.exports = router;