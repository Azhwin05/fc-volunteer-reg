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
  available_dates: z.array(z.string()).min(1, "Select at least one available date"),
  preferred_slots: z.array(z.string()).min(1, "Select at least one time slot"),
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
  
  // Parse FormData ... (remains same)
  const rawData: Record<string, any> = {}
  const arrayKeys = ['preferred_roles', 'skills', 'available_dates', 'preferred_slots']
  
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
  
  // Get Role Code (First letter of first role, e.g., 'M' for Medical)
  const roleCode = parsed.data.preferred_roles[0]?.charAt(0).toUpperCase() || 'G' // G for General
  
  // Get Sequence (Current count + 1001) for basic ordering
  // Note: For high-concurrency production, use a Database Sequence/Trigger. 
  // For this event scale, count is sufficient.
  const { count, error: countError } = await supabase.from('volunteers').select('*', { count: 'exact', head: true })

  if (countError) {
      console.error("Supabase Count Error:", countError)
      return { message: "Database Connection Failed. Check configuration.", error: true, fields: rawData }
  }

  const sequence = (count || 0) + 1001
  
  const reference_id = `FC26-${roleCode}-${sequence}`

  // ---------------------------------------------------------
  // 2. Insert into DB
  // ---------------------------------------------------------
  const { error } = await supabase.from('volunteers').insert({
    ...parsed.data,
    reference_id,
    status: 'Registered'
  })

  if (error) {
    console.error('Supabase Insert Error:', error)
    if (error.code === '23505') { 
        return { message: "This email or phone number is already registered.", error: true, fields: rawData }
    }
    return { message: `Registration Failed: ${error.message}`, error: true, fields: rawData }
  }

  // ---------------------------------------------------------
  // 3. Revalidate Admin Path (Fixes Sync Issue)
  // ---------------------------------------------------------
  revalidatePath('/admin')

  return {
    message: "Registration Successful!",
    error: false,
    referenceId: reference_id
  }
}
