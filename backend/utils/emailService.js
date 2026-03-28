const transporter = require("./mail");

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Email error for ${to}:`, error);
  }
};

module.exports = { sendEmail };
