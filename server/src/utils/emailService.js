const nodemailer = require('nodemailer');

// Mock email service if SMTP variables are not configured
const createTransporter = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    
    // Mock transporter
    return {
        sendMail: async (mailOptions) => {
            console.log('=========================================');
            console.log('📧 MOCK EMAIL SENT (No SMTP configured)');
            console.log(`To: ${mailOptions.to}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Body:\n${mailOptions.text || mailOptions.html}`);
            console.log('=========================================');
            return { messageId: 'mock-id' };
        }
    };
};

const transporter = createTransporter();

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"CampusConnect" <noreply@campusconnect.local>',
            to,
            subject,
            text,
            html: html || text,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendEmail };
