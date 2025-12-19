/**
 * Email Service using Brevo (formerly Sendinblue) API
 * Brevo allows sending to ANY recipient on the free tier (300 emails/day)
 * provided you verify the SENDER email.
 * 
 * Setup:
 * 1. Go to https://brevo.com and sign up
 * 2. Verify your sender email (e.g. your gmail) in "Senders & IP"
 * 3. Create an API key (My Account -> SMTP & API -> Create a new API Key)
 * 4. Add BREVO_API_KEY to your Railway environment variables
 */

const sendEmail = async ({ to, subject, html, text }) => {
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey) {
        throw new Error('BREVO_API_KEY is not configured');
    }

    // Sender must be verified in Brevo
    // We use the EMAIL_USER env var which you already have set to your gmail
    const senderEmail = process.env.EMAIL_USER; 
    const senderName = 'TaskMind';

    if (!senderEmail) {
        throw new Error('EMAIL_USER is not configured');
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: senderName,
                    email: senderEmail
                },
                to: [
                    { email: to }
                ],
                subject: subject,
                htmlContent: html || text, // Brevo requires htmlContent
                textContent: text
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Brevo API error:', data);
            throw new Error(data.message || 'Failed to send email via Brevo');
        }

        console.log(`✅ Email sent via Brevo to ${to}, MessageId: ${data.messageId}`);
        return data;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
};

module.exports = { sendEmail };
