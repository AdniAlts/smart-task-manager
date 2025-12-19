/**
 * Email Service using Resend API
 * Resend is an HTTP-based email service that works on PaaS platforms like Railway
 * where SMTP ports are typically blocked.
 * 
 * Setup:
 * 1. Go to https://resend.com and sign up (free tier: 100 emails/day)
 * 2. Create an API key
 * 3. Add RESEND_API_KEY to your Railway environment variables
 * 4. (Optional) Verify a domain for custom sender emails, or use onboarding@resend.dev
 */

const sendEmail = async ({ to, subject, html, text }) => {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured');
    }

    // Use verified domain email or Resend's test sender
    const fromEmail = process.env.EMAIL_FROM || 'TaskMind <onboarding@resend.dev>';

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [to],
                subject: subject,
                html: html || undefined,
                text: text || undefined
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Resend API error:', data);
            throw new Error(data.message || 'Failed to send email via Resend');
        }

        console.log(`✅ Email sent via Resend to ${to}, ID: ${data.id}`);
        return data;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
};

module.exports = { sendEmail };
