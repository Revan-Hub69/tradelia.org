import axios from 'axios'
import { env } from '../config/env'

// Brevo email service
export class EmailService {
  private apiKey: string
  private baseUrl = 'https://api.brevo.com/v3'

  constructor() {
    if (!env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is required for email service')
    }
    this.apiKey = env.BREVO_API_KEY
  }

  private async makeRequest(endpoint: string, data: any) {
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Email service error:', error.response?.data || error.message)
      throw new Error('Failed to send email')
    }
  }

  /**
   * Send OTP email for authentication
   */
  async sendOTPEmail(to: string, otp: string): Promise<void> {
    const emailData = {
      sender: {
        name: 'Tradelia',
        email: 'noreply@tradelia.org'
      },
      to: [{
        email: to,
        name: to.split('@')[0] // Use username part
      }],
      subject: 'Your Tradelia Login Code',
      htmlContent: this.generateOTPEmailHTML(otp),
      textContent: this.generateOTPEmailText(otp)
    }

    await this.makeRequest('/smtp/email', emailData)
  }

  /**
   * Send welcome email for new users
   */
  async sendWelcomeEmail(to: string, name?: string): Promise<void> {
    const displayName = name || to.split('@')[0]

    const emailData = {
      sender: {
        name: 'Tradelia Team',
        email: 'welcome@tradelia.org'
      },
      to: [{
        email: to,
        name: displayName
      }],
      subject: 'Welcome to Tradelia - AI Trading Platform',
      htmlContent: this.generateWelcomeEmailHTML(displayName),
      textContent: this.generateWelcomeEmailText(displayName)
    }

    await this.makeRequest('/smtp/email', emailData)
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const emailData = {
      sender: {
        name: 'Tradelia Support',
        email: 'support@tradelia.org'
      },
      to: [{
        email: to,
        name: to.split('@')[0]
      }],
      subject: 'Reset Your Tradelia Password',
      htmlContent: this.generatePasswordResetEmailHTML(resetLink),
      textContent: this.generatePasswordResetEmailText(resetLink)
    }

    await this.makeRequest('/smtp/email', emailData)
  }

  private generateOTPEmailHTML(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your Tradelia Login Code</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border: 2px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Tradelia Security</h1>
              <p>Your account verification code</p>
            </div>
            <div class="content">
              <h2>Hello Trader!</h2>
              <p>You requested to sign in to your Tradelia account. Use the verification code below:</p>

              <div class="otp-code">${otp}</div>

              <p><strong>Important:</strong> This code expires in 10 minutes for your security.</p>
              <p>If you didn't request this code, please ignore this email.</p>

              <div class="footer">
                <p>Tradelia - AI Applied to Markets Research</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateOTPEmailText(otp: string): string {
    return `
Tradelia - Your Login Code

Hello Trader!

Your verification code is: ${otp}

This code expires in 10 minutes.

If you didn't request this code, please ignore this email.

Tradelia - AI Applied to Markets Research
This is an automated message.
    `.trim()
  }

  private generateWelcomeEmailHTML(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Tradelia</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Welcome to Tradelia!</h1>
              <p>Your AI Trading Journey Begins</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Welcome to Tradelia, the advanced AI trading platform that applies artificial intelligence to market research.</p>

              <h3>What's Next?</h3>
              <ul>
                <li>Complete your profile setup</li>
                <li>Configure your exchange API keys</li>
                <li>Explore market insights and signals</li>
                <li>Start automated trading strategies</li>
              </ul>

              <a href="https://tradeliaorg-production.up.railway.app/dashboard" class="cta-button">Access Your Dashboard</a>

              <p>If you have any questions, feel free to reach out to our support team.</p>

              <div class="footer">
                <p>Happy Trading!</p>
                <p>Tradelia Team</p>
                <p>Tradelia - AI Applied to Markets Research</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateWelcomeEmailText(name: string): string {
    return `
Welcome to Tradelia!

Hello ${name}!

Welcome to Tradelia, the advanced AI trading platform.

What's Next?
- Complete your profile setup
- Configure your exchange API keys
- Explore market insights and signals
- Start automated trading strategies

Access your dashboard: https://tradeliaorg-production.up.railway.app/dashboard

Happy Trading!
Tradelia Team
    `.trim()
  }

  private generatePasswordResetEmailHTML(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
              <p>Secure your Tradelia account</p>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>You requested to reset your password for your Tradelia account.</p>
              <p>Click the button below to create a new password:</p>

              <a href="${resetLink}" class="cta-button">Reset Password</a>

              <p><strong>Important:</strong> This link expires in 1 hour for your security.</p>
              <p>If you didn't request this reset, please ignore this email.</p>

              <div class="footer">
                <p>Tradelia - AI Applied to Markets Research</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generatePasswordResetEmailText(resetLink: string): string {
    return `
Tradelia - Password Reset

You requested to reset your password.

Click here to reset: ${resetLink}

This link expires in 1 hour.

If you didn't request this reset, please ignore this email.

Tradelia - AI Applied to Markets Research
    `.trim()
  }
}

// Export singleton instance
export const emailService = env.BREVO_API_KEY ? new EmailService() : null
