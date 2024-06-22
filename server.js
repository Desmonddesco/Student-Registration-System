// Required imports
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session'); // For session management
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Gerson.66',
    database: 'student_registration'
});

connection.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to check if user is authenticated
function checkAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

/// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mushiana.desmond@gmail.com',
        pass: 'disb cmne mzlc kkrw'
    }
});

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!isValidPassword(password)) {
            return res.status(400).json({ error: 'Password does not meet the required criteria' });
        }

        if (password === email) {
            return res.status(400).json({ error: 'Password should not be the same as the email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            title: req.body.title,
            first_name: req.body.first_name,
            surname: req.body.surname,
            address_street: req.body.street,
            address_city: req.body.city,
            address_state: req.body.state,
            zip_code: req.body.zip_code,
            email: email,
            highest_qualification: req.body.highest_qualification,
            password_hash: hashedPassword
        };

        connection.query('INSERT INTO users SET ?', newUser, (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({ error: 'Failed to register user' });
            }
            console.log('User registered successfully');

            // Send confirmation email
            const mailOptions = {
                from: 'mushiana.desmond@gmail.com',
                to: email,
                subject: 'Registration Confirmation',
                text: `Hello ${req.body.first_name},\n\nThank you for registering at the Student Registration System.\n\nBest regards,\nStudent Registration System`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ error: 'Failed to send confirmation email' });
                }
                console.log('Confirmation email sent:', info.response);
                res.status(201).json({ message: 'User registered successfully. Confirmation email sent.' });
            });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});
// Reset Password endpoint
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    connection.query('SELECT * FROM users WHERE reset_token = ?', [token], async (err, results) => {
        if (err) {
            console.error('Error fetching user with reset token:', err);
            return res.status(500).json({ error: 'Failed to reset password' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        const user = results[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        connection.query('UPDATE users SET password_hash = ?, reset_token = NULL WHERE id = ?', [hashedPassword, user.id], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ error: 'Failed to reset password' });
            }

            res.status(200).json({ message: 'Password reset successfully' });
        });
    });
});
// Forgot Password endpoint
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    // Generate a unique token for password reset (you can use a library like crypto or UUID)
    const resetToken = require('crypto').randomBytes(32).toString('hex');

    // Update user's record in the database to store resetToken
    connection.query('UPDATE users SET reset_token = ? WHERE email = ?', [resetToken, email], (err, result) => {
        if (err) {
            console.error('Error updating reset token:', err);
            return res.status(500).json({ error: 'Failed to process request' });
        }

        // Send reset password email
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`; // Replace with your frontend reset password link
        const mailOptions = {
            from: 'mushiana.desmond@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `Hello,\n\nYou have requested a password reset. Please click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nStudent Registration System`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending password reset email:', error);
                return res.status(500).json({ error: 'Failed to send password reset email' });
            }
            console.log('Password reset email sent:', info.response);
            res.status(200).json({ message: 'Password reset email sent successfully' });
        });
    });
});

function isValidPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}


// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    connection.query('SELECT * FROM users WHERE email = ?', email, async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: 'Login failed' });
            return;
        }

        if (results.length === 0) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            res.status(401).json({ error: 'Incorrect password' });
            return;
        }

        // Set user session
        req.session.userId = user.id;
        res.status(200).json({ message: 'Login successful', user: user });
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).json({ error: 'Failed to log out' });
        } else {
            res.status(200).json({ message: 'Logout successful' });
        }
    });
});

// Endpoint to get user data
app.get('/user', checkAuth, (req, res) => {
    connection.query('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            res.status(500).json({ error: 'Failed to fetch user data' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const user = results[0];
        res.status(200).json(user);
    });
});

// Endpoint to update user data
app.put('/user', checkAuth, (req, res) => {
    const updatedData = {
        title: req.body.title,
        first_name: req.body.first_name,
        surname: req.body.surname,
        address_street: req.body.address_street,
        address_city: req.body.address_city,
        address_state: req.body.address_state,
        zip_code: req.body.zip_code,
        email: req.body.email,
        highest_qualification: req.body.highest_qualification
    };

    connection.query('UPDATE users SET ? WHERE id = ?', [updatedData, req.session.userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            res.status(500).json({ error: 'Failed to update user' });
            return;
        }

        res.status(200).json({ message: 'User details updated successfully' });
    });
});

// Serve reset-password.html for the reset password route
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'reset-password.html'));
});

// Catch-all route to serve index.html for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
