
const axios = require('axios');

class OTPService {
  static async sendOTP(phoneNumber) {
    try {
      const otplessResponse = await axios.post('https://auth.otpless.app/auth/otp/v1/send', {
        phoneNumber,
        otpLength: 6,
        channel: 'SMS',
        expiry: 600 // 10 minutes
      }, {
        headers: {
          'clientId': process.env.OTPLESS_CLIENT_ID,
          'clientSecret': process.env.OTPLESS_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      });

      console.log('OTPless API Response:', otplessResponse.data);

      if (otplessResponse.data && otplessResponse.data.orderId) {
        return {
          success: true,
          orderId: otplessResponse.data.orderId
        };
      } else {
        throw new Error('OTPless API did not return orderId');
      }
    } catch (error) {
      console.error('OTP sending error:', error);
      
      if (error.response) {
        console.error('OTPless API Error Response:', error.response.data);
      }
      
      throw new Error('Failed to send OTP');
    }
  }

  static async verifyOTP(phoneNumber, otp, orderId) {
    try {
      console.log('Verifying OTP:', { phoneNumber, otp, orderId });

      const verifyResponse = await axios.post('https://auth.otpless.app/auth/otp/v1/verify', {
        orderId,
        otp,
        phoneNumber
      }, {
        headers: {
          'clientId': process.env.OTPLESS_CLIENT_ID,
          'clientSecret': process.env.OTPLESS_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      });

      console.log('OTPless Verify Response:', verifyResponse.data);

      const isVerified = verifyResponse.data.isOTPVerified || 
                        verifyResponse.data.verified || 
                        verifyResponse.data.success ||
                        (verifyResponse.data.status && verifyResponse.data.status === 'SUCCESS');

      if (!isVerified) {
        console.log('OTP verification failed:', verifyResponse.data);
        throw new Error('Invalid OTP or OTP has expired');
      }

      return {
        success: true,
        userId: verifyResponse.data.userId
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error.response) {
        console.error('OTPless Verify API Error Response:', error.response.data);
      }
      
      throw new Error('OTP verification failed');
    }
  }

  static validatePhoneNumber(phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!/^\+91[6-9]\d{9}$/.test(cleanPhone)) {
      throw new Error('Please provide a valid Indian phone number');
    }
    return cleanPhone;
  }
}

module.exports = OTPService;
