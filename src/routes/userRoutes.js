const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

router.post('/users', userController.createUser);
router.get('/users', authMiddleware, permissionMiddleware(['admin']), userController.listUsers);

module.exports = router;