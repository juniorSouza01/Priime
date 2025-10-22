const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

router.post('/users', userController.createUser); // Qualquer um pode criar usuário inicialmente
router.get('/users', authMiddleware, permissionMiddleware(['admin']), userController.listUsers); // Apenas admin pode listar

module.exports = router;