const validateRecaptcha = async (token) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('RECAPTCHA_SECRET_KEY tidak ditemukan di environment variables');
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`
    });

    const data = await response.json();
    
    return {
      success: data.success,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      'error-codes': data['error-codes']
    };
  } catch (error) {
    console.error('Error validating reCAPTCHA:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  validateRecaptcha
};