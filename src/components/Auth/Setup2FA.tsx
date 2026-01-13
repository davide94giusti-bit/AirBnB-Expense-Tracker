import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as OTPAuth from 'otpauth';

interface Props {
  userId: string;
  onSetup: (secret: string) => void;
}

export default function Setup2FA({ userId, onSetup }: Props) {
  const [secret] = useState(() => {
    const totp = new OTPAuth.TOTP({
      issuer: 'AirBnB Control',
      label: userId,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });
    return totp.secret.base32;
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  function handleVerify() {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'AirBnB Control',
        label: userId,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      const now = Math.floor(Date.now() / 1000);
      let isValid = false;

      for (let i = -1; i <= 1; i++) {
        const testTime = now + i * 30;
        const token = totp.generate({ timestamp: testTime * 1000 });
        
        if (token === verificationCode) {
          isValid = true;
          break;
        }
      }

      if (isValid) {
        onSetup(secret);
      } else {
        setError('Invalid code. Make sure your device time is correct.');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error(err);
    }
  }

  const totp = new OTPAuth.TOTP({
    issuer: 'AirBnB Control',
    label: userId,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          Set Up Authenticator
        </h3>

        <div className="flex justify-center mb-6 bg-white p-4 rounded">
          <QRCodeSVG
            value={totp.toString()}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="text-slate-300 mb-4">
          Scan this QR code with Google Authenticator, Authy, or Microsoft Authenticator
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit code"
          maxLength={6}
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-center text-2xl tracking-widest text-slate-100 mb-4"
          autoFocus
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={verificationCode.length !== 6}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 rounded transition"
        >
          Verify & Enable 2FA
        </button>

        <p className="text-xs text-slate-400 mt-4">
          Secret: <code className="bg-slate-900 px-2 py-1 rounded">{secret}</code>
        </p>
      </div>
    </div>
  );
}
