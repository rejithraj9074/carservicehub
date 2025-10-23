import Razorpay from 'razorpay';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing Razorpay configuration...');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET);

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Missing Razorpay keys in environment variables');
  process.exit(1);
}

try {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  
  console.log('✅ Razorpay instance created successfully');
  
  // Test the connection
  razorpay.payments.all({ count: 1 })
    .then(response => {
      console.log('✅ Razorpay connection test successful');
      console.log('Response:', response);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Razorpay connection test failed');
      console.error('Error:', error);
      console.error('Status code:', error.statusCode);
      console.error('Error code:', error.code);
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Error creating Razorpay instance:', error);
  process.exit(1);
}