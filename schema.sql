-- Create an Enum for Volunteer Status
create type volunteer_status as enum ('Registered', 'Assigned', 'On Duty', 'Completed', 'Rejected');

-- Create the Volunteers Table
create table volunteers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reference_id text unique not null,
  
  -- Personal Information
  full_name text not null,
  email text not null,
  phone text not null,
  age int not null,
  
  -- Role & Skills (Arrays for multiple selections)
  preferred_roles text[] not null default '{}', 
  skills text[] not null default '{}',
  custom_skills text, 
  
  -- Boolean Flags
  has_experience boolean default false,
  comfort_special_needs boolean default false,
  transport_needed boolean default false,
  
  -- Logistics
  available_dates text[] default '{}',
  preferred_slots text[] default '{}',
  location text,
  
  -- Emergency Contact
  emergency_contact_name text,
  emergency_contact_phone text,
  
  -- Admin Fields
  status volunteer_status default 'Registered',
  assigned_role text,
  admin_notes text
);

-- Enable Row Level Security (RLS)
alter table volunteers enable row level security;

-- Policy: Anyone can INSERT (Public Registration)
create policy "Enable insert for everyone" on volunteers
  for insert with check (true);

-- Policy: Only Admins can VIEW/UPDATE (We will handle this via Middleware/Service Role in App, 
-- but strictly speaking proper Auth policies should be set if using Supabase Auth users)
-- For now, we will allow 'service_role' (server side) full access and public only insert.
