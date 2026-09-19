const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"SecureAuth" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your SecureAuth verification code",
    html: `
      <div style="
        margin: 0;
        padding: 40px 20px;
        background: #f7f8fc;
        font-family: Arial, sans-serif;
      ">
        <div style="
          max-width: 520px;
          margin: auto;
          background: #ffffff;
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        ">
          <div style="
            width: 48px;
            height: 48px;
            line-height: 48px;
            margin: 0 auto 24px;
            border-radius: 14px;
            background: #0f172a;
            color: white;
            font-weight: bold;
            font-size: 20px;
          ">
            S
          </div>

          <h1 style="
            margin: 0 0 12px;
            color: #0f172a;
            font-size: 28px;
          ">
            Verify your email
          </h1>

          <p style="
            color: #64748b;
            font-size: 15px;
            line-height: 1.6;
          ">
            Use the verification code below to complete
            your SecureAuth registration.
          </p>

          <div style="
            margin: 30px 0;
            padding: 18px;
            border-radius: 16px;
            background: #f5f3ff;
            color: #7c3aed;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
          ">
            ${otp}
          </div>

          <p style="
            color: #94a3b8;
            font-size: 13px;
          ">
            This code expires in 5 minutes.
          </p>

          <p style="
            margin-top: 30px;
            color: #cbd5e1;
            font-size: 12px;
          ">
            If you didn't request this code, you can safely ignore
            this email.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = sendOTPEmail;
