'use client'

import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useRef } from 'react'

const qrcodeRegionId = "html5qr-code-full-region"

interface QrReaderProps {
  onScanSuccess: (decodedText: string) => void
  onScanFailure?: (error: any) => void
}

export default function QrReader({ onScanSuccess, onScanFailure }: QrReaderProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Prevent double initialization
    if (scannerRef.current) return

    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    }
    
    // Create instance
    const scanner = new Html5QrcodeScanner(qrcodeRegionId, config, false)
    scannerRef.current = scanner

    scanner.render(
        (decodedText) => {
             // Stop scanning on success if needed, or just callback
             // We'll let parent handle logic
             onScanSuccess(decodedText)
             scanner.clear()
        }, 
        (error) => {
            if (onScanFailure) onScanFailure(error)
        }
    )

    // Cleanup
    return () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error)
            scannerRef.current = null
        }
    }
  }, [onScanSuccess, onScanFailure])

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-3xl border-2 border-slate-200 bg-white">
        <div id={qrcodeRegionId} className="w-full" />
    </div>
  )
}
