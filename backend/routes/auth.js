
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const { check, validationResult } = require('express-validator'); 

const users = []; 
let userIdCounter = 1; 

router.post(
  '/register',
  [
   
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      let user = users.find(u => u.email === email);
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      user = {
        id: userIdCounter++, 
        username,
        email,
        passwordHash, 
        role: 'user',
        level: 1,     
        xp: 0         
      };
      users.push(user); 
      console.log('Registered user:', user.email); 

      
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

     
      jwt.sign(
        payload,
        'your_jwt_secret',
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err; 
          res.json({ msg: 'User registered successfully', token });
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error'); 
    }
  }
);


router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ msg: 'Invalid Credentials' });
      }

     
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        'your_jwt_secret', 
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ msg: 'Login successful', token });
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router; 