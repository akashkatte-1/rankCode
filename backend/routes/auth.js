// backend/routes/auth.js
// This file defines the authentication-related API endpoints.

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Library for creating and verifying JSON Web Tokens
const { check, validationResult } = require('express-validator'); // Middleware for input validation

// --- Placeholder for a simple in-memory 'database' for demonstration ---
// In a real-world application, this array would be replaced by a connection
// to a persistent database like MySQL, PostgreSQL, MongoDB, etc.
// For now, users are stored in memory and will be reset when the server restarts.
const users = []; // Stores user objects: { id, username, email, passwordHash, role, level, xp }
let userIdCounter = 1; // Simple counter for unique user IDs
// --------------------------------------------------------------------

/**
 * @route POST /api/auth/register
 * @desc Register a new user account.
 * @access Public (no authentication required to access this route)
 *
 * Request Body:
 * {
 * "username": "testuser",
 * "email": "test@example.com",
 * "password": "password123"
 * }
 */
router.post(
  '/register',
  [
    // Input validation using express-validator:
    // Ensures username, email, and password meet basic requirements.
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are validation errors, return a 400 Bad Request response
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure user input from the request body
    const { username, email, password } = req.body;

    try {
      // 1. Check if a user with the given email already exists in our 'database'
      let user = users.find(u => u.email === email);
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // 2. Hash the password for security:
      //    - `genSalt(10)` generates a salt (random string) with a cost factor of 10.
      //      The salt is used to make each hash unique, even for the same password.
      //    - `hash(password, salt)` hashes the user's plain-text password using the generated salt.
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 3. Create a new user object and add it to our in-memory 'database'
      user = {
        id: userIdCounter++, // Assign a unique ID
        username,
        email,
        passwordHash, // Store the hashed password
        role: 'user', // Default role for new users
        level: 1,     // Initial level
        xp: 0         // Initial experience points
      };
      users.push(user); // Add the new user to the array
      console.log('Registered user:', user.email); // Log the new user (for debugging)

      // 4. Generate a JSON Web Token (JWT):
      //    - `payload`: Contains information about the user (e.g., ID, role).
      //      This information is encoded into the token and can be retrieved later.
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      //    - `jwt.sign()` creates the token:
      //      - `payload`: The data to encode.
      //      - `'your_jwt_secret'`: A secret key known only to the server.
      //        This is used to sign the token, ensuring its integrity.
      //        **IMPORTANT**: In a production environment, this secret MUST be
      //        a strong, randomly generated string stored in environment variables,
      //        NOT hardcoded in the source code.
      //      - `{ expiresIn: '1h' }`: The token will expire after 1 hour.
      //        This adds a layer of security by limiting the token's validity.
      jwt.sign(
        payload,
        'your_jwt_secret', // TODO: Replace with a strong secret from environment variables (e.g., process.env.JWT_SECRET)
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err; // If there's an error during token generation, throw it
          // Send a successful response with the generated JWT token
          res.json({ msg: 'User registered successfully', token });
        }
      );

    } catch (err) {
      // Catch any unexpected errors during the process
      console.error(err.message);
      res.status(500).send('Server error'); // Send a generic server error response
    }
  }
);

/**
 * @route POST /api/auth/login
 * @desc Authenticate a user and return a JWT token.
 * @access Public (no authentication required to access this route)
 *
 * Request Body:
 * {
 * "email": "test@example.com",
 * "password": "password123"
 * }
 */
router.post(
  '/login',
  [
    // Input validation for login credentials
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure email and password from the request body
    const { email, password } = req.body;

    try {
      // 1. Check if a user with the given email exists
      const user = users.find(u => u.email === email);
      if (!user) {
        // If user not found, return 401 Unauthorized (Invalid Credentials)
        return res.status(401).json({ msg: 'Invalid Credentials' });
      }

      // 2. Compare the provided password with the stored hashed password:
      //    - `bcrypt.compare()` takes the plain-text password and the hashed password.
      //      It hashes the plain-text password with the salt extracted from the stored hash
      //      and compares the result.
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        // If passwords don't match, return 401 Unauthorized (Invalid Credentials)
        return res.status(401).json({ msg: 'Invalid Credentials' });
      }

      // 3. Generate a JWT token upon successful authentication (same as registration)
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        'your_jwt_secret', // TODO: Replace with a strong secret from environment variables
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          // Send a successful response with the JWT token
          res.json({ msg: 'Login successful', token });
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router; // Export the router to be used in server.js
