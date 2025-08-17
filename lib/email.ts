/**
 * Email Configuration for Brevo (SendinBlue)
 * 
 * This file provides configuration and utility functions for sending emails
 * using Brevo's SMTP and API services.
 * 
 * Setup Instructions:
 * 1. Sign up at https://app.brevo.com
 * 2. Get SMTP credentials from https://app.brevo.com/settings/keys/api
 * 3. Set environment variables in .env.local
 */

import nodemailer from 'nodemailer';

// Email configuration from environment variables
export const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // your Brevo SMTP login
      pass: process.env.SMTP_PASS, // your Brevo SMTP key
    },
  },
  from: {
    email: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
    name: process.env.FROM_NAME || 'Blogen Shopify CMS',
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    apiUrl: process.env.BREVO_API_URL || 'https://api.brevo.com/v3',
  },
  templates: {
    emailVerification: parseInt(process.env.EMAIL_VERIFICATION_TEMPLATE_ID || '1'),
    passwordReset: parseInt(process.env.PASSWORD_RESET_TEMPLATE_ID || '2'),
    welcome: parseInt(process.env.WELCOME_EMAIL_TEMPLATE_ID || '3'),
    blogNotification: parseInt(process.env.BLOG_NOTIFICATION_TEMPLATE_ID || '4'),
  },
  lists: {
    newsletter: parseInt(process.env.NEWS_LETTER_LIST_ID || '2'),
    notifications: parseInt(process.env.USER_NOTIFICATIONS_LIST_ID || '7'),
  },
  limits: {
    daily: parseInt(process.env.EMAIL_DAILY_LIMIT || '300'),
    rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT || '100'),
    retryAttempts: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3'),
  },
};

// Create nodemailer transporter for SMTP
export const createTransporter = () => {
  return nodemailer.createTransporter(emailConfig.smtp);
};

// Email sending interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: keyof typeof emailConfig.templates;
  templateData?: Record<string, any>;
}

// Send email using SMTP
export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

// Brevo API client setup
export class BrevoApiClient {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = emailConfig.brevo.apiKey || '';
    this.apiUrl = emailConfig.brevo.apiUrl;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'accept': 'application/json',
        'api-key': this.apiKey,
        'content-type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Send transactional email using template
  async sendTransactionalEmail(data: {
    templateId: number;
    to: Array<{ email: string; name?: string }>;
    params?: Record<string, any>;
    subject?: string;
  }) {
    return this.makeRequest('/smtp/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Add contact to list
  async addContactToList(listId: number, contact: {
    email: string;
    attributes?: Record<string, any>;
    emailBlacklisted?: boolean;
    smsBlacklisted?: boolean;
    updateEnabled?: boolean;
  }) {
    return this.makeRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        ...contact,
        listIds: [listId],
      }),
    });
  }

  // Create email campaign
  async createEmailCampaign(campaign: {
    name: string;
    subject: string;
    sender: { name: string; email: string };
    type?: 'classic' | 'trigger';
    htmlContent?: string;
    recipients?: { listIds: number[] };
    scheduledAt?: string;
  }) {
    return this.makeRequest('/emailCampaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  // Get campaign statistics
  async getCampaignStats(campaignId: number) {
    return this.makeRequest(`/emailCampaigns/${campaignId}`);
  }
}

// Utility functions for common email operations
export const emailUtils = {
  // Send welcome email to new user
  async sendWelcomeEmail(userEmail: string, userName: string) {
    const brevo = new BrevoApiClient();
    
    return brevo.sendTransactionalEmail({
      templateId: emailConfig.templates.welcome,
      to: [{ email: userEmail, name: userName }],
      params: {
        FIRSTNAME: userName,
        LOGIN_URL: `${process.env.NEXTAUTH_URL}/login`,
      },
    });
  },

  // Send password reset email
  async sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const brevo = new BrevoApiClient();
    
    return brevo.sendTransactionalEmail({
      templateId: emailConfig.templates.passwordReset,
      to: [{ email: userEmail }],
      params: {
        RESET_URL: `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
      },
    });
  },

  // Send email verification
  async sendEmailVerification(userEmail: string, verificationToken: string) {
    const brevo = new BrevoApiClient();
    
    return brevo.sendTransactionalEmail({
      templateId: emailConfig.templates.emailVerification,
      to: [{ email: userEmail }],
      params: {
        VERIFICATION_URL: `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`,
      },
    });
  },

  // Subscribe user to newsletter
  async subscribeToNewsletter(email: string, firstName?: string, lastName?: string) {
    const brevo = new BrevoApiClient();
    
    return brevo.addContactToList(emailConfig.lists.newsletter, {
      email,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
      },
    });
  },

  // Send blog notification
  async sendBlogNotification(subscribers: string[], blogPost: {
    title: string;
    excerpt: string;
    url: string;
    author: string;
  }) {
    const brevo = new BrevoApiClient();
    
    const recipients = subscribers.map(email => ({ email }));
    
    return brevo.sendTransactionalEmail({
      templateId: emailConfig.templates.blogNotification,
      to: recipients,
      params: {
        BLOG_TITLE: blogPost.title,
        BLOG_EXCERPT: blogPost.excerpt,
        BLOG_URL: blogPost.url,
        AUTHOR_NAME: blogPost.author,
      },
    });
  },
};

// Validation functions
export const validateEmailConfig = () => {
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASS',
    'FROM_EMAIL',
  ];

  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required email environment variables: ${missing.join(', ')}`);
  }

  return true;
};

export default {
  config: emailConfig,
  sendEmail,
  BrevoApiClient,
  utils: emailUtils,
  validateConfig: validateEmailConfig,
};