const express = require("express");
const {check, validationResult} = require('express-validator/check');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');
const { v4 : uuid} = require('uuid');


const User = require('../models/User');

// @route   GET api/users
// @desc    Get All the Users Available
// @access  Public

router.get('/', async (req, res) => {
    try {
        await res.json(db.users.map(user => {
            return {
                id: user.id,
                name: user.name,
                occupation: user.occupation
            }
        }));
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   /api/users/:id
// @desc    Get user by ID
// @access  Public

router.get('/:id', async (req, res) => {
    try {
        const user = db.users.filter(user => user.id === req.params.id)[0];
        if(user === undefined) return res.status(404).json({message: 'User with this ID does not exist.'});
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

// @route   POST api/users
// @desc    Add a User
// @access  Public

router.post('/',[
    check('name', 'Enter a valid Name atleast of 3 characters').isLength({min:3}),
    check('password', 'Enter a valid Password').exists(),
    check('occupation', 'Enter an Occupation').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    try {
        // Destructure body
        const {name, password} = req.body;
        // Find if user already exists - stop here
        const user = db.users.filter(user => user.name === name)[0];
        if(user != undefined) return res.status(400).json({message: "User already exists"});
        // Assign user an ID
        req.body.id = uuid();
        // Get User from Schema
        const newUser = User(req.body);
        // Hash the User password
        const salt = await bcrypt.genSalt(5);
        newUser.password = await bcrypt.hash(password, salt);
        // Push to database
        db.users = await [
            ...db.users,
            newUser
        ]
        await res.json(newUser);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
