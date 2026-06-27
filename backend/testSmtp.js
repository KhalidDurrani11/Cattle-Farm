import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'kkjan9198@gmail.com',
    pass: 'byghnsqlepfuzcjq',
  },
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: 'kkjan9198@gmail.com',
      to: 'kkjan9198@gmail.com', // send to self
      subject: 'Test Email',
      text: 'This is a test email to verify SMTP credentials.',
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}

testEmail();
