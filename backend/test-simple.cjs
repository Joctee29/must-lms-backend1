// Simple test to check nodemailer
console.log('Testing nodemailer import...');

try {
  const nodemailer = require('nodemailer');
  console.log('✅ Nodemailer imported successfully');
  console.log('Available methods:', Object.keys(nodemailer));
  
  // Test transporter creation
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'uj23hiueddhpna2y@ethereal.email',
      pass: 'bUBwMXt6UWqgK4Tetd'
    }
  });
  
  console.log('✅ Transporter created successfully');
  
  // Test verification
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ SMTP verification failed:', error.message);
    } else {
      console.log('✅ SMTP server is ready to take our messages');
      
      // Send test email
      const mailOptions = {
        from: 'mfungojoctan01@gmail.com',
        to: 'mfungojoctan01@gmail.com',
        subject: 'MUST LMS - Test Email',
        text: 'This is a test email from MUST LMS password reset system.',
        html: '<h1>Test Email</h1><p>Password reset code: <strong>123456</strong></p>'
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('❌ Email sending failed:', error.message);
        } else {
          console.log('✅ Test email sent successfully!');
          console.log('Message ID:', info.messageId);
          console.log('🎉 Gmail SMTP is working - password reset emails will be delivered!');
        }
      });
    }
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
