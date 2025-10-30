import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend('re_dmPv6KPR_2gcHihjT4UyWHGmUzvrfYfaA');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, description } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !description) {
      return res.status(400).json({ 
        error: 'All fields are required: name, email, subject, and description' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Send email via Resend
    // Note: Using verified email for testing. For production, verify domain at resend.com/domains
    const { data, error } = await resend.emails.send({
      from: 'The Spice App Support <onboarding@resend.dev>',
      to: ['kwitter1982@gmail.com'], // Using verified email address
      replyTo: email,
      subject: `Support Ticket: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 20px;
                border: 1px solid #e5e7eb;
              }
              .field {
                margin-bottom: 15px;
              }
              .label {
                font-weight: bold;
                color: #374151;
              }
              .value {
                margin-top: 5px;
                padding: 10px;
                background: white;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
              }
              .footer {
                margin-top: 20px;
                padding: 15px;
                background: #f3f4f6;
                border-radius: 0 0 8px 8px;
                font-size: 12px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">🎫 New Support Ticket</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${subject}</div>
                </div>
                <div class="field">
                  <div class="label">Description:</div>
                  <div class="value">${description.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
              <div class="footer">
                <p style="margin: 0;">This ticket was submitted via The Spice App Help & Support form.</p>
                <p style="margin: 5px 0 0 0;">Submitted on: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send support ticket. Please try again.' });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Support ticket submitted successfully',
      emailId: data?.id
    });
  } catch (error: any) {
    console.error('Support ticket submission error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
