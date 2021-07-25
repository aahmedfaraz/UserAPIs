const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const bcrypt = require('bcrypt');

const db = require('../db');

// @route   /api/auth
// @desc    Authorize User
// @access  Public

router.post('/',[
    check('name','Please provide a valid name').isLength({min: 3}),
    check('password', 'Please provide a password').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    try {
        // Destructure request body
        const {name, password} = req.body;
        // Find by Name either user exists
        const user = await db.users.filter( user => user.name === name)[0];
        if(user === undefined) return res.status(404).json({"authenticated": false, "message": 'User does not exist'});
        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(404).json({"authenticated": false, "message": 'Invalid Password'});
        // If user exists and password is correct, login
        res.json({"authenticated": true,"message": `User [${user.name}] is Authenticated`});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;