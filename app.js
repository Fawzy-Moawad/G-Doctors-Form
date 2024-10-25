require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse URL-encoded data and JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS for all origins
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Route to handle form submission
app.post('/send', (req, res) => {
    const { date, patient_name, date_of_birth, patient_address, patient_phone, medical_conditions, reason_for_referral, special_requests, radiographs, referring_dentist, dentist_address, dentist_phone } = req.body;

    // Format radiographs data
    const radiographsFormatted = Array.isArray(radiographs) ? radiographs.join(', ') : 'No selection';

    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL, // Your Hostinger email address
            pass: process.env.PASSWORD // Your Hostinger email password
        }
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL, // Your email address from .env
        to: 'info@drgebril.com',
        subject: 'Doctors Referral Form',
        text: `Date: ${date}\nPatient Name: ${patient_name}\nDate Of Birth: ${date_of_birth}\nPatient Address: ${patient_address}\nPatient Phone: ${patient_phone}\nMedical Conditions: ${medical_conditions}\nReason for Referral: ${reason_for_referral}\nSpecial Requests: ${special_requests}\nRadiographs: ${radiographsFormatted}\nReferring Dentist Dr.: ${referring_dentist}\nDentist Address: ${dentist_address}\nDentist Phone: ${dentist_phone}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending email' });
        }
        console.log('Email sent:', info.response);
        res.json({ message: 'Form sent successfully' }); // Send JSON response
    });
});

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
