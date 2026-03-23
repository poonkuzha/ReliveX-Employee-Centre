const nodemailer = require('nodemailer');
const axios = require('axios');
const Notification = require('../models/Notification');

// ── In-app notification ───────────────────────────────────────
exports.createNotification = async (userId, type, title, message, refId = null) => {
  try {
    await Notification.create({ userId, type, title, message, refId });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};

// ── Email via NodeMailer ──────────────────────────────────────
exports.sendEmail = async (to, subject, htmlBody) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: `"Relivex Employee Centre" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlBody
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

// ── Slack Webhook ─────────────────────────────────────────────
exports.sendSlackNotification = async (message) => {
  try {
    if (!process.env.SLACK_WEBHOOK_URL) return;
    await axios.post(process.env.SLACK_WEBHOOK_URL, { text: message });
    console.log('💬 Slack notification sent');
  } catch (err) {
    console.error('Slack notification error:', err.message);
  }
};

// ── Expense email templates ───────────────────────────────────
exports.expenseEmailHtml = (employee, expense, status, reason = '') => `
<div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8faff; border-radius: 12px;">
  <div style="background: linear-gradient(135deg, #0a1628, #1a3a6b); padding: 24px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #fff; margin: 0; font-size: 20px;">Relivex Employee Centre</h2>
    <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Expense Request Update</p>
  </div>
  <p style="color: #1e293b;">Dear <strong>${employee.name}</strong>,</p>
  <p style="color: #1e293b;">Your expense request has been <strong style="color: ${status === 'Approved' ? '#16a34a' : '#dc2626'}">${status}</strong>.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #fff; border-radius: 8px; overflow: hidden;">
    <tr style="background: #eef2ff;"><td style="padding: 10px 16px; font-size: 13px; color: #6b7897;">Employee ID</td><td style="padding: 10px 16px; font-size: 13px; font-weight: 600;">${employee.employeeId}</td></tr>
    <tr><td style="padding: 10px 16px; font-size: 13px; color: #6b7897;">Amount</td><td style="padding: 10px 16px; font-size: 13px; font-weight: 600;">$${expense.amount.toLocaleString()}</td></tr>
    <tr style="background: #eef2ff;"><td style="padding: 10px 16px; font-size: 13px; color: #6b7897;">Priority</td><td style="padding: 10px 16px; font-size: 13px; font-weight: 600;">${expense.priority}</td></tr>
    <tr><td style="padding: 10px 16px; font-size: 13px; color: #6b7897;">Status</td><td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: ${status === 'Approved' ? '#16a34a' : '#dc2626'};">${status}</td></tr>
    ${reason ? `<tr style="background: #eef2ff;"><td style="padding: 10px 16px; font-size: 13px; color: #6b7897;">Reason</td><td style="padding: 10px 16px; font-size: 13px;">${reason}</td></tr>` : ''}
  </table>
  <p style="color: #6b7897; font-size: 12px; margin-top: 20px;">© 2026 Relivex Technologies Pvt. Ltd.</p>
</div>`;
