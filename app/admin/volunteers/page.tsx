import VolunteerDashboard from "@/components/admin-dashboard"

export default async function VolunteersPage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Volunteer Roster</h1>
          <p className="text-slate-500">Manage, assign, and track all registered volunteers.</p>
       </div>
       <VolunteerDashboard />
    </div>
  )
}
