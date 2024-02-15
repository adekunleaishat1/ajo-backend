const nodemailer = require("nodemailer");

const forgotpasswordmail = async (email, username, OTP) => {
  const messageTemplate = `
    <div>
        <h2>Welcome message</h2>
        <ul>
            <li>Name: ${username}</li>
            <li>Email: ${email}</li>
        </ul>
        <div>
            <p>Dear ${username}, </p>
            <p>Kindly use this code ${OTP} to reset your password</p>
        </div>
    </div>
`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "unityfund877@gmail.com",
      pass: "rsqusxwcoswlqwyt",
    },
  });

  const mailOptions = {
    from: "aishatadekunle877@gmail.com",
    to: email,
    subject: "Registration message",
    text: "Test App",
    html: messageTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully");
  } catch (error) {
    throw {
      name: "MailerError",
      message: `Error sending mail: ${error}`,
    };
  }
};

module.exports = {forgotpasswordmail}