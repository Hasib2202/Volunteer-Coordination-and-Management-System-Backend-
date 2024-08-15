import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'imation337@gmail.com',
        pass: 'irvx wxlz oefp gjce',
      },
    });
  }

  async sendEventNotification(
    email: string,
    nickName: string,
    eventName: string,
    eventDate: string,
  ): Promise<void> {
    const mailOptions = {
      from: 'imation337@gmail.com',
      to: email,
      subject: 'Event Assignment Notification',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Assignment</title>
          <style>
          //-------------------------
            // .event-details {
            //   font-size: 16px;
            //   color: black;
            // }
            // .header {
            //   font-size: 24px;
            //   font-weight: bold;
            //   color: #333;
            // }
          //--------------------------
            body { font-family: Arial, sans-serif; }
            .container { padding: 20px; }
            h1 { color: #333; }
            p { color: #555; }
          </style>
      </head>
      <body>
      <div class="container">
          <h1 class="header">Event Assignment</h1>
          <p>Hello ${nickName},</p>
          <p>You have been assigned to volunteer at <strong>${eventName}</strong> on <strong>${eventDate}</strong>.</p>
          <p>Thank you for your participation!</p>
          <p>Event Manager!</p>
      </div>
      </body>
      </html>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendResetCodeEmail(userEmail: string, resetCode: string): Promise<void> {
    if (!userEmail) {
      throw new Error('Email address is required');
    }

    const mailOptions = {
      from: 'imation337@gmail.com',
      to: userEmail,
      subject: 'Password Reset Code',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Code</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { padding: 20px; }
            h1 { color: #333; }
            p { color: #555; }
            .reset-code { font-size: 24px; font-weight: bold; color: #007bff; }
          </style>
      </head>
      <body>
      <div class="container">
          <h1>Password Reset Code</h1>
          <p>You have requested to reset your password. Use the following code to complete the process:</p>
          <p class="reset-code">${resetCode}</p>
          <p>This code will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
      </div>
      </body>
      </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}