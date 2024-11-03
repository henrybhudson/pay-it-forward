const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/getFeed', userController.getFeed);
router.post('/createChain', userController.createChain);
router.post('/joinChain', userController.joinChain);
router.get('/getNominations', userController.getNominations);
router.get('/generateIdea', userController.generateIdea);

module.exports = router;