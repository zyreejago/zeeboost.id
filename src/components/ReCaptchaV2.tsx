'use client';

import ReCAPTCHA from 'react-google-recaptcha';
import { useRef } from 'react';

interface ReCaptchaV2Props {
  siteKey: string;
  onVerify: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
}

export default function ReCaptchaV2({
  siteKey,
  onVerify,
  onExpired,
  onError,
  theme = 'light',
  size = 'normal',
  className = ''
}: ReCaptchaV2Props) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (token: string | null) => {
    onVerify(token);
  };

  const handleExpired = () => {
    if (onExpired) onExpired();
  };

  const handleError = () => {
    if (onError) onError();
  };

  // Expose reset method
  const reset = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  return (
    <div className={`recaptcha-container ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onExpired={handleExpired}
        onError={handleError}
        theme={theme}
        size={size}
        hl="en"
      />
    </div>
  );
}