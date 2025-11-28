import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'Evos <noreply@evos.ai>';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

export function isEmailConfigured(): boolean {
  return !!resend;
}

export async function sendVerificationEmail(email: string, token: string, name: string): Promise<boolean> {
  if (!resend) {
    console.log(`[DEV] Verification email for ${email}: ${APP_URL}/verify-email?token=${token}`);
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your Evos account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030014; color: #fff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; }
            .logo { font-size: 24px; font-weight: bold; background: linear-gradient(to right, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #6366f1, #8b5cf6, #06b6d4); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
            .footer { color: #6b7280; font-size: 12px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🧬 Evos</div>
            <h1>Welcome to Identity Engineering, ${name}!</h1>
            <p>You're one click away from understanding yourself better than ever before.</p>
            <a href="${APP_URL}/verify-email?token=${token}" class="button">Verify My Email</a>
            <p style="color: #9ca3af;">This link expires in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an Evos account, you can safely ignore this email.</p>
              <p>© 2024 Evos AI — The World's First Identity Engineering Platform</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string): Promise<boolean> {
  if (!resend) {
    console.log(`[DEV] Password reset email for ${email}: ${APP_URL}/reset-password?token=${token}`);
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your Evos password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030014; color: #fff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; }
            .logo { font-size: 24px; font-weight: bold; background: linear-gradient(to right, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #6366f1, #8b5cf6, #06b6d4); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
            .footer { color: #6b7280; font-size: 12px; margin-top: 40px; }
            .warning { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px; border-radius: 8px; color: #fca5a5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🧬 Evos</div>
            <h1>Reset your password, ${name}</h1>
            <p>Someone (hopefully you) requested a password reset for your Evos account.</p>
            <a href="${APP_URL}/reset-password?token=${token}" class="button">Reset My Password</a>
            <p style="color: #9ca3af;">This link expires in 1 hour.</p>
            <div class="warning">
              ⚠️ If you didn't request this, please ignore this email. Your password will remain unchanged.
            </div>
            <div class="footer">
              <p>© 2024 Evos AI — The World's First Identity Engineering Platform</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

export async function sendStreakReminderEmail(email: string, name: string, streak: number): Promise<boolean> {
  if (!resend) {
    console.log(`[DEV] Streak reminder for ${email}: ${streak} day streak`);
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🔥 Don't break your ${streak}-day streak!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030014; color: #fff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; }
            .logo { font-size: 24px; font-weight: bold; }
            .streak { font-size: 64px; font-weight: bold; background: linear-gradient(to right, #f97316, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #6366f1, #8b5cf6, #06b6d4); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🧬 Evos</div>
            <h1>Hey ${name}!</h1>
            <div class="streak">🔥 ${streak}</div>
            <p>You've been proving your identity for <strong>${streak} days straight</strong>. Don't stop now!</p>
            <p>Today's actions are waiting for you.</p>
            <a href="${APP_URL}/dashboard" class="button">Complete Today's Actions</a>
          </div>
        </body>
        </html>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send streak reminder:', error);
    return false;
  }
}

export async function sendExperimentMilestoneEmail(
  email: string, 
  name: string, 
  day: number, 
  totalDays: number = 30
): Promise<boolean> {
  if (!resend) {
    console.log(`[DEV] Milestone email for ${email}: Day ${day}/${totalDays}`);
    return true;
  }

  const milestoneMessages: Record<number, { title: string; message: string }> = {
    7: { 
      title: "🎯 Week 1 Complete!", 
      message: "You've survived the hardest part. Most people quit by day 3. You didn't." 
    },
    14: { 
      title: "💪 Halfway There!", 
      message: "Two weeks of identity engineering. You're building neural pathways that will last." 
    },
    21: { 
      title: "🧠 Habit Formed!", 
      message: "Science says 21 days creates a habit. You just rewired your brain." 
    },
    30: { 
      title: "🏆 Experiment Complete!", 
      message: "30 days. You did it. You're not the same person who started this journey." 
    }
  };

  const milestone = milestoneMessages[day];
  if (!milestone) return true;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: milestone.title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030014; color: #fff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; text-align: center; }
            .logo { font-size: 24px; font-weight: bold; }
            .day { font-size: 80px; font-weight: bold; background: linear-gradient(to right, #6366f1, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #6366f1, #8b5cf6, #06b6d4); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🧬 Evos</div>
            <h1>${milestone.title}</h1>
            <div class="day">Day ${day}</div>
            <p style="font-size: 18px;">${milestone.message}</p>
            <a href="${APP_URL}/experiment" class="button">View Your Progress</a>
          </div>
        </body>
        </html>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send milestone email:', error);
    return false;
  }
}

