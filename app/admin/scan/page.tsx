'use client'

import React, { useState } from 'react'
import QrReader from '@/components/qr-reader'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, Scan, User, RefreshCw, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type ScanResult = {
    valid: boolean
    message: string
    volunteer?: any
}

export default function ScanPage() {
  const [data, setData] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanMode, setScanMode] = useState(true)
  const supabase = createClient()

  const handleScan = async (decodedText: string) => {
      setScanMode(false) // Stop scanning UI
      setLoading(true)
      
      try {
          // Parse JSON { "id": "...", "type": "volunteer" }
          let refId = decodedText
          try {
              const json = JSON.parse(decodedText)
              if (json.id) refId = json.id
          } catch(e) {
              // Not JSON, assume plain text ID
          }

          console.log("Scanned:", refId)

          const { data: vol, error } = await supabase
            .from('volunteers')
            .select('*')
            .eq('reference_id', refId)
            .single()

          if (error || !vol) {
              setData({ valid: false, message: "Ticket not found in database." })
          } else {
              setData({ valid: true, message: "Verified Volunteer", volunteer: vol })
          }

      } catch (err) {
         setData({ valid: false, message: "Invalid QR Code format." })
      } finally {
          setLoading(false)
      }
  }

  const checkInVolunteer = async () => {
      if (!data?.volunteer) return
      setLoading(true)
      
      const { error } = await supabase
        .from('volunteers')
        .update({ status: 'On Duty' })
        .eq('id', data.volunteer.id)

      if (!error) {
          setData(prev => prev ? ({ ...prev, volunteer: { ...prev.volunteer, status: 'On Duty' } }) : null)
      }
      setLoading(false)
  }

  const resetScan = () => {
      setData(null)
      setScanMode(true)
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900">Scan Ticket</h1>
           <p className="text-slate-500">Scan volunteer QR code for check-in.</p>
        </div>

        {scanMode ? (
            <div className="space-y-4 animate-in fade-in zoom-in">
                 <QrReader onScanSuccess={handleScan} />
                 <p className="text-center text-xs text-slate-400">Point camera at the QR code</p>
            </div>
        ) : (
            <Card className="border-2 border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-8">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-black"/>
                        <p>Verifying Ticket...</p>
                    </div>
                ) : data?.valid ? (
                    <>
                        <div className="bg-green-500 p-6 flex flex-col items-center text-white">
                             <div className="bg-white/20 p-3 rounded-full mb-3">
                                 <CheckCircle2 className="w-8 h-8" />
                             </div>
                             <h2 className="text-xl font-bold">Valid Ticket</h2>
                             <p className="text-green-100 text-sm mt-1">Reference: {data.volunteer.reference_id}</p>
                        </div>
                        <CardContent className="pt-6 space-y-6">
                             <div className="text-center">
                                 <h3 className="text-2xl font-bold text-slate-900">{data.volunteer.full_name}</h3>
                                 <Badge variant="outline" className="mt-2 bg-slate-50">{data.volunteer.preferred_roles?.[0]}</Badge>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                 <div className="bg-slate-50 p-3 rounded-lg">
                                     <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Status</span>
                                     <span className={`font-bold ${data.volunteer.status === 'On Duty' ? 'text-green-600' : 'text-slate-700'}`}>
                                         {data.volunteer.status}
                                     </span>
                                 </div>
                                  <div className="bg-slate-50 p-3 rounded-lg">
                                     <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Age</span>
                                     <span className="font-bold text-slate-700">{data.volunteer.age}</span>
                                 </div>
                             </div>

                             {data.volunteer.status !== 'On Duty' && (
                                 <Button onClick={checkInVolunteer} className="w-full bg-black hover:bg-zinc-800 text-white h-12 rounded-xl text-lg shadow-lg">
                                     Check In Now
                                 </Button>
                             )}

                             {data.volunteer.status === 'On Duty' && (
                                 <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center text-sm font-medium">
                                     Already Checked In
                                 </div>
                             )}
                        </CardContent>
                    </>
                ) : (
                    <div className="p-8 text-center flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Ticket</h2>
                        <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium">{data?.message}</p>
                    </div>
                )}
                
                {!loading && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50">
                        <Button variant="outline" onClick={resetScan} className="w-full rounded-xl h-11 border-slate-200">
                             <Scan className="w-4 h-4 mr-2" /> Scan Another
                        </Button>
                    </div>
                )}
            </Card>
        )}
    </div>
  )
}
