'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// Define the specific allowed values for error correction level
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QrCodeProps {
  value: string;
  size?: number;
  level?: ErrorCorrectionLevel; // Changed type from string to ErrorCorrectionLevel
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
  className?: string;
}

const QrCode: React.FC<QrCodeProps> = ({
  value,
  size = 128,
  level = 'L', // Error correction level: L, M, Q, H
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  includeMargin = false,
  className = ''
}) => {
  if (!value) {
    return <div className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`} style={{ width: size, height: size }}>No QR Data</div>;
  }

  return (
    <div className={className}>
      <QRCodeCanvas
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        includeMargin={includeMargin}
      />
    </div>
  );
};

export default QrCode;
