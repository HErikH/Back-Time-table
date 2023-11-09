const express = require('express');
const router = express.Router();
const AuthorizationController = require('../controllers/AuthorizationController.js');

/* POST page. */
router.post('/login', AuthorizationController.login);

module.exports = router;