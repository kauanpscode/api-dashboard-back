const express = require("express");

const {
  createUser,
  getAllUsers,
  getUserbyId,
  updateUserById,
  deleteUserById,
} = require("../controllers/UserController");

const router = express.Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserbyId);
router.put("/:id", updateUserById);
router.delete("/:id", deleteUserById);

module.exports = router;
