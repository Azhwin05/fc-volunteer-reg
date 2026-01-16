'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Define the schema for validation
const volunteerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  age: z.coerce.number().min(18, "You must be at least 18 years old").max(100, "Invalid age"),
  preferred_roles: z.array(z.string()).min(1, "Please select at least one role"),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  custom_skills: z.string().optional(),
  has_experience: z.boolean().default(false),
  comfort_special_needs: z.boolean().default(false),
  transport_needed: z.boolean().default(false),
  // available_dates: Removed as per request
  // preferred_slots: Removed as per request
  location: z.string().min(2, "Location is required"),
  organization: z.string().optional(),
  emergency_contact_name: z.string().min(2, "Emergency contact name is required"),
  emergency_contact_phone: z.string().min(10, "Emergency contact phone is required"),
})

export type FormState = {
  message: string
  error?: boolean
  referenceId?: string
  fields?: Record<string, any>
  issues?: string[]
}

export async function registerVolunteer(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  
  const rawData: Record<string, any> = {}
  const arrayKeys = ['preferred_roles', 'skills']
  
  arrayKeys.forEach(k => rawData[k] = [])

  for (const [key, value] of formData.entries()) {
    if (arrayKeys.includes(key)) {
      rawData[key].push(value)
    } else if (key === 'has_experience' || key === 'comfort_special_needs' || key === 'transport_needed') {
       rawData[key] = value === 'on' 
    } else {
      rawData[key] = value
    }
  }

  // Validate
  const parsed = volunteerSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      message: "Please check your input and try again.",
      error: true,
      fields: rawData,
      issues: parsed.error.issues.map(i => i.message)
    }
  }

  // ---------------------------------------------------------
  // 0. CHECK ENVIRONMENT
  // ---------------------------------------------------------
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
     console.error("FATAL: Missing Supabase Environment Variables")
     return {
        message: "System Configuration Error: Missing Environment Variables. Please contact admin.",
        error: true, 
        fields: rawData
     }
  }

  // ---------------------------------------------------------
  // 1. Generate Meaningful Reference ID
  // Format: FC26-{ROLE_CODE}-{SEQUENCE}
  // ---------------------------------------------------------
  
  // ---------------------------------------------------------
  // 1 & 2. Generate Reference ID & Insert (With Retry)
  // ---------------------------------------------------------
  
  // Get Role Code (First letter of first role, e.g., 'M' for Medical)
  const roleCode = parsed.data.preferred_roles[0]?.charAt(0).toUpperCase() || 'G' // G for General
  
  let attempts = 0
  const maxAttempts = 3
  
  while (attempts < maxAttempts) {
      attempts++
      
      // Get Sequence (Find max existing sequence)
      const { data: lastVolunteer } = await supabase
          .from('volunteers')
          .select('reference_id')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
    
      let sequence = 1001
      if (lastVolunteer?.reference_id) {
          const parts = lastVolunteer.reference_id.split('-')
          if (parts.length === 3) {
              const lastSeq = parseInt(parts[2])
              if (!isNaN(lastSeq)) {
                  // If we are retrying, maybe add a random jump or just +1 again?
                  // Simple +1 is usually enough unless high concurrency.
                  sequence = lastSeq + 1
              }
          }
      }
      
      const reference_id = `FC26-${roleCode}-${sequence}`

      const { error } = await supabase.from('volunteers').insert({
        ...parsed.data,
        reference_id,
        status: 'Registered'
      })
    
      if (!error) {
          // Success!
          revalidatePath('/admin')
          return {
            message: "Registration Successful!",
            error: false,
            referenceId: reference_id
          }
      }

      console.error(`Attempt ${attempts} failed:`, error)

      // If it's NOT a unique violation (23505), fail immediately.
      // If it IS a unique violation, loop again to retry with new ID.
      if (error.code !== '23505') {
          return { message: `Registration Failed: ${error.message}`, error: true, fields: rawData }
      }
      
      // If we are here, it was a 23505 error. Wait a tiny bit (backoff) to let other transaction finish?
      // Optional: await new Promise(r => setTimeout(r, 100 * attempts))
  }

  // If loop finishes without returning, we failed all attempts
  return { message: "System Busy: Unable to generate ID. Please try again.", error: true, fields: rawData }


}
