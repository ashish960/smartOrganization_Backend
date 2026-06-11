import nodemailer from "nodemailer";

const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED === "true",
        },
    });
};

export const sendOTPEmail = async (toEmail, otp, userName) => {
    const transporter = getTransporter();

    await transporter.sendMail({
        from: `"SmartOrg AI" <${process.env.EMAIL}>`,
        to: toEmail,
        subject: "Your Password Reset OTP - SmartOrg AI",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f1a; border-radius: 16px; border: 1px solid #1e1e2e;">
                <h1 style="color: #fff; font-size: 24px; margin-bottom: 8px;">SmartOrg AI</h1>
                <p style="color: #a0a0b0; font-size: 14px; margin-bottom: 32px;">Password Reset Request</p>

                <p style="color: #e0e0f0; font-size: 15px;">Hi <strong>${userName}</strong>,</p>
                <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">
                    We received a request to reset your password. Use the OTP below to proceed.
                    This OTP is valid for <strong style="color: #fff;">10 minutes</strong>.
                </p>

                <div style="background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15)); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                    <p style="color: #a0a0b0; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px;">Your OTP</p>
                    <p style="color: #fff; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0;">${otp}</p>
                </div>

                <p style="color: #a0a0b0; font-size: 13px; line-height: 1.6;">
                    If you did not request a password reset, please ignore this email. 
                    Your account is safe.
                </p>

                <hr style="border: none; border-top: 1px solid #1e1e2e; margin: 24px 0;" />
                <p style="color: #606070; font-size: 12px;">SmartOrg AI · Enterprise Document Intelligence</p>
            </div>
        `,
    });
};