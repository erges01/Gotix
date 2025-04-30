const axios = require("axios");

const sendEmail = async (to, subject, text, html = "") => {
  try {
    console.log("🔑 Using Resend API Key:", process.env.RESEND_API_KEY ? "Loaded" : "MISSING");
    console.log("📨 Sending Email To:", to);
    console.log("📤 Email From:", process.env.EMAIL_FROM);
    
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: process.env.EMAIL_FROM, // ✅ Must be 'no-reply@yourdomain.resend.dev'
        to: [to],
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Email error:", error.response?.data || error.message);
    
    if (error.response) {
      console.error("📡 API Response Status:", error.response.status);
      console.error("📡 API Response Data:", JSON.stringify(error.response.data, null, 2));
    }
  }
};

module.exports = sendEmail;
