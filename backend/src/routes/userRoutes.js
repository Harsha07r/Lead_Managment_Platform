const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, createUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
