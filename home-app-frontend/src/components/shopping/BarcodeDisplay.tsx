import { Box } from '@mantine/core'
import { QRCodeSVG } from 'qrcode.react'
import Barcode from 'react-barcode'

interface BarcodeDisplayProps {
  code: string
  type: 'QR' | 'CODE_128'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  style?: React.CSSProperties
}

const sizePresets = {
  sm: { qr: 80, barcode: { width: 1, height: 40, fontSize: 10 } },
  md: { qr: 150, barcode: { width: 1.5, height: 60, fontSize: 14 } },
  lg: { qr: 280, barcode: { width: 2, height: 100, fontSize: 16 } },
}

export function BarcodeDisplay({ code, type, size = 'md', onClick, style }: BarcodeDisplayProps) {
  const preset = sizePresets[size]

  return (
    <Box
      bg="white"
      p={size === 'sm' ? 'xs' : 'md'}
      style={{
        borderRadius: size === 'sm' ? 4 : 8,
        border: '1px solid var(--mantine-color-gray-2)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
    >
      {type === 'QR' ? (
        <QRCodeSVG value={code} size={preset.qr} />
      ) : (
        <Barcode value={code} {...preset.barcode} />
      )}
    </Box>
  )
}