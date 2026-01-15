'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { registerVolunteer } from '@/app/actions'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useState, useRef, useEffect } from "react"
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, User, Briefcase, CalendarCheck, FileCheck } from "lucide-react"

// Constants
const ROLES = [
  "Event Management",
  "Volunteer Management",
  "Stage Program & Activities",
  "Off-Stage Engagement Events",
  "Game and PlayStation Management",
  "Registration & Help Desk",
  "Children's Care & Inclusion",
  "Special Schools Coordination",
  "Sponsorship & Fundraising",
  "Logistics & Infrastructure",
  "Food & Refreshments",
  "Medical & Safety",
  "Media & Communication",
  "Gifts and Materials Sourcing and Distribution",
  "Hygiene and Waste Management"
]

const SKILLS = [
  "First Aid / CPR", "Photography", "Videography", "Driving (Car/Van)", "Event Management", "Multilingual", "Teaching / Training", "Technical / IT"
]


function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-full bg-black hover:bg-zinc-800 text-white font-medium py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all"
    >
      {pending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : "Complete Registration"}
    </Button>
  )
}

function SectionHeading({ number, title, active }: { number: number, title: string, active: boolean }) {
  return (
    <div className={`flex items-center mb-6 transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>
      <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold ${active ? 'bg-black text-white' : 'bg-slate-200 text-slate-500'}`}>
        {number}
      </span>
      <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>
    </div>
  )
}

import QRCode from "react-qr-code"

export default function RegistrationForm() {
  const [state, formAction] = useFormState(registerVolunteer, { message: "", error: false })
  const [step, setStep] = useState(1)
  const formRef = useRef<HTMLFormElement>(null)
  
  // Download Logic
  const downloadTicket = () => {
    const svg = document.getElementById("qr-code-svg")
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `Reference-${state.referenceId}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }
  }
  
  // Local Storage Key
  const STORAGE_KEY = 'fc_volunteer_form_state'

  useEffect(() => {
    // 1. Load from Storage on Mount
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // We only restore if there's no referenceId committed yet
        if (!state.referenceId && parsed) {
            // Restore inputs manually since we are using uncontrolled inputs mostly
            Object.entries(parsed).forEach(([key, value]) => {
                const el = document.querySelector(`[name="${key}"]`) as HTMLInputElement
                if (el) {
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        if (Array.isArray(value)) {
                            el.checked = value.includes(el.value)
                        } else {
                            el.checked = el.value === value
                        }
                    } else {
                        el.value = value as string
                    }
                }
            })
        }
      } catch (e) {
        console.error("Failed to load form state", e)
      }
    }

    // 2. Clear storage on successful submission
    if (state.referenceId) {
        localStorage.removeItem(STORAGE_KEY)
        setStep(5)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [state])

  // 3. Save to Storage on Change
  const handleFormChange = () => {
      if (formRef.current) {
          const formData = new FormData(formRef.current)
          const data: Record<string, any> = {}
           // Simple serialization
          for (const [key, value] of formData.entries()) {
             // Handle arrays for same-named keys
             if (data[key]) {
                 if (!Array.isArray(data[key])) data[key] = [data[key]]
                 data[key].push(value)
             } else {
                 data[key] = value
             }
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
  }
  
  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault()

    if (formRef.current) {
        const formData = new FormData(formRef.current)
        
        // STEP 1 VALIDATION
        if (step === 1) {
            const requiredFields = ['full_name', 'organization', 'age', 'location', 'phone', 'email', 'emergency_contact_name', 'emergency_contact_phone']
            const emptyFields = requiredFields.filter(field => !formData.get(field))
            
            if (emptyFields.length > 0) {
                // Simple alert for immediate blocking, or we could set state.message
                alert(`Please fill in all required fields:\n${emptyFields.join(', ')}`)
                return
            }
        }

        // STEP 2 VALIDATION
        if (step === 2) {
            const roles = formData.getAll('preferred_roles')
            const skills = formData.getAll('skills')
            
            if (roles.length === 0) {
                alert("Please select at least one role.")
                return
            }
            if (skills.length === 0) {
                alert("Please select at least one skill.")
                return
            }
        }
    }

    setStep(s => Math.min(s + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault()
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (state.referenceId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">You're In!</h2>
        <p className="text-slate-500 max-w-md mb-8">
          Registration successful. Save your ticket below.
        </p>
        
        {/* TICKET CARD for QR */}
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-xl mb-8 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-6">Freedom Carnival 2026</h3>
            <div className="bg-white p-4 rounded-xl border border-slate-100 mb-4" id="qr-wrapper">
                 <QRCode 
                    id="qr-code-svg"
                    value={JSON.stringify({ id: state.referenceId, type: 'volunteer' })} 
                    size={200}
                    level="H"
                 />
            </div>
            <span className="font-mono text-2xl font-black text-slate-800 tracking-widest bg-slate-50 px-4 py-2 rounded-lg">{state.referenceId}</span>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
           <Button onClick={downloadTicket} className="w-full bg-black text-white hover:bg-zinc-800 rounded-full h-14 text-lg">
             Download Ticket
           </Button>
           <Button onClick={() => window.location.reload()} variant="outline" className="w-full rounded-full h-14 border-2 hover:bg-slate-50">
             Start New Registration
           </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      
      {state.error && state.message && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md">
          <p className="font-bold">Error</p>
          <p>{state.message}</p>
          {state.issues && (
            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
              {state.issues.map((issue, idx) => <li key={idx}>{issue}</li>)}
            </ul>
          )}
        </div>
      )}

      <form action={formAction} ref={formRef} onChange={handleFormChange}>
        <div className="bg-white rounded-3xl md:rounded-[32px] shadow-sm border border-slate-100 p-5 md:p-12">
            
            {/* STEP 1: PERSONAL INFO */}
            <div className={step === 1 ? "block animate-in slide-in-from-right-8 fade-in duration-300" : "hidden"}>
               <SectionHeading number={1} title="Tell us about yourself" active={true} />
               <div className="space-y-4 md:space-y-6">
                     <div className="col-span-2">
                       <Label className="text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Full Name</Label>
                       <Input name="full_name" placeholder="E.g. Jane Doe" defaultValue={state.fields?.full_name} className="h-12 md:h-14 px-4 md:px-6 rounded-2xl bg-slate-50 border-transparent focus:border-black focus:ring-0 focus:bg-white transition-all text-base md:text-lg" />
                     </div>
                     <div className="col-span-2">
                       <Label className="text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Organization / Institution Name</Label>
                       <Input name="organization" placeholder="College, Company, or NGO Name" defaultValue={state.fields?.organization} className="h-12 md:h-14 px-4 md:px-6 rounded-2xl bg-slate-50 border-transparent focus:border-black focus:ring-0 focus:bg-white transition-all text-base md:text-lg" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <Label className="text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Age</Label>
                         <Input name="age" type="number" placeholder="25" min="18" max="99" defaultValue={state.fields?.age} className="h-12 md:h-14 px-4 md:px-6 rounded-2xl bg-slate-50 border-transparent focus:border-black focus:ring-0 focus:bg-white transition-all text-base md:text-lg" />
                       </div>
                        <div>
                          <Label className="text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Location</Label>
                          <Input name="location" placeholder="City/Area" defaultValue={state.fields?.location} className="h-12 md:h-14 px-4 md:px-6 rounded-2xl bg-slate-50 border-transparent focus:border-black focus:ring-0 focus:bg-white transition-all text-base md:text-lg" />
                       </div>
                     </div>
                      <div>
                        <Label className="text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Phone</Label>
                        <Input name="phone" type="tel" placeholder="+91..." defaultValue={state.fields?.phone} className="h-12 md:h-14 px-4 md:px-6 rounded-2xl bg-slate-50 border-transparent focus:border-black focus:ring-0 focus:bg-white transition-all text-base md:text-lg" />
                     </div>
                     <div className="col-span-2">
                        <Label className="text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mb-2 block">Email Address</Label>
                        <Input name="email" type="email" placeholder="jane@example.com" defaultValue={state.fields?.email} className="h-12 md:h-14 px-4 md:px-6 rounded-2xl bg-slate-50 border-transparent focus:border-black focus:ring-0 focus:bg-white transition-all text-base md:text-lg" />
                     </div>
                     
                     <div className="pt-4 border-t border-slate-100">
                        <Label className="text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mb-4 block">Emergency Contact</Label>
                        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                             <div>
                                <Input name="emergency_contact_name" placeholder="Contact Name" className="h-12 md:h-14 rounded-xl bg-slate-50 border-transparent text-base md:text-lg" />
                             </div>
                             <div>
                                <Input name="emergency_contact_phone" placeholder="Emergency Phone" className="h-12 md:h-14 rounded-xl bg-slate-50 border-transparent text-base md:text-lg" />
                             </div>
                        </div>
                     </div>
               </div>
            </div>

            {/* STEP 2: ROLES */}
            <div className={step === 2 ? "block animate-in slide-in-from-right-8 fade-in duration-300" : "hidden"}>
              <SectionHeading number={2} title="How can you help?" active={true} />
              
              <div className="space-y-6 md:space-y-8">
                <div>
                    <Label className="text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mb-3 md:mb-4 block">Select Roles</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                        {ROLES.map((role) => (
                        <label key={role} className="flex items-center space-x-3 p-3 md:p-4 rounded-xl border-2 border-slate-100 cursor-pointer hover:border-black transition-colors [&:has(:checked)]:border-black [&:has(:checked)]:bg-slate-50">
                            <Checkbox name="preferred_roles" value={role} className="w-5 h-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-black data-[state=checked]:border-black shrink-0" />
                            <span className="font-medium text-sm md:text-base text-slate-800 leading-tight">{role}</span>
                        </label>
                        ))}
                    </div>
                </div>
                
                <Separator />
                
                <div>
                     <Label className="text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mb-3 md:mb-4 block">Skills</Label>
                     <div className="flex flex-wrap gap-2 md:gap-3">
                        {SKILLS.map((skill) => (
                             <label key={skill} className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50 [&:has(:checked)]:bg-slate-900 [&:has(:checked)]:text-white [&:has(:checked)]:border-slate-900 transition-all">
                                <input type="checkbox" name="skills" value={skill} className="hidden" />
                                <span className="text-xs md:text-sm font-medium">{skill}</span>
                            </label>
                        ))}
                     </div>
                     <Input name="custom_skills" placeholder="Other skills..." className="mt-4 h-12 rounded-xl bg-slate-50 border-transparent text-sm md:text-base" />
                </div>
              </div>
            </div>

             {/* STEP 3: REVIEW */}
             <div className={step === 3 ? "block animate-in slide-in-from-right-8 fade-in duration-300" : "hidden"}>
                 <SectionHeading number={3} title="One last check" active={true} />
                 
                 <div className="bg-slate-50 p-4 md:p-6 rounded-2xl mb-6 md:mb-8">
                    <p className="text-base md:text-lg font-medium text-slate-800 mb-3 md:mb-4">Declaration</p>
                    <label className="flex items-start space-x-3 cursor-pointer">
                         <Checkbox id="consent" required className="mt-1 w-4 h-4 md:w-5 md:h-5 rounded-md" />
                         <span className="text-slate-600 leading-relaxed text-xs md:text-sm">
                            I verify that all the information provided is accurate. I understand that my role assignment is subject to availability and the discretion of the organizers. I agree to the potential background verification if required.
                         </span>
                    </label>
                 </div>
             </div>

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between mt-8 md:mt-12 pt-6 border-t border-slate-100">
                {step > 1 ? (
                    <Button type="button" variant="ghost" onClick={prevStep} className="text-slate-500 hover:text-slate-900 font-medium text-sm md:text-base">
                        Back
                    </Button>
                ) : <div />}

                {step < 3 ? (
                    <Button type="button" onClick={nextStep} className="bg-black hover:bg-zinc-800 text-white rounded-full px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all h-12 flex items-center">
                        Next Step <ChevronRight className="ml-2 w-4 h-4"/>
                    </Button>
                ) : (
                    <div className="w-full pl-4 md:pl-6"><SubmitButton /></div>
                )}
            </div>
            
            {/* Steps Indicator - Minimal */}
            <div className="flex justify-center space-x-2 mt-6 md:mt-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-6 md:w-8 bg-slate-900' : 'w-2 bg-slate-200'}`} />
                ))}
            </div>

        </div>
      </form>
    </div>
  )
}
