import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, ShieldAlert, Clock, Activity } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Parallel Fetching for Speed
  const [
    { count: totalCount },
    { count: registeredCount },
    { count: onDutyCount },
    { data: recentVolunteers }
  ] = await Promise.all([
    supabase.from('volunteers').select('*', { count: 'exact', head: true }),
    supabase.from('volunteers').select('*', { count: 'exact', head: true }).eq('status', 'Registered'),
    supabase.from('volunteers').select('*', { count: 'exact', head: true }).eq('status', 'On Duty'),
    supabase.from('volunteers').select('full_name, preferred_roles, created_at, status').order('created_at', { ascending: false }).limit(5)
  ])

  // Role Distribution (Simple aggregation - could be done via RPC for perf but JS is fine for <1000 records)
  const { data: allRoles } = await supabase.from('volunteers').select('preferred_roles')
  const roleCounts: Record<string, number> = {}
  allRoles?.forEach(v => {
      v.preferred_roles?.forEach((r: string) => {
          roleCounts[r] = (roleCounts[r] || 0) + 1
      })
  })
  
  // Sort roles by popularity
  const topRoles = Object.entries(roleCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Real-time overview of Freedom Carnival volunteers.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="rounded-[24px] border-none shadow-sm bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total Volunteers</CardTitle>
            <Users className="h-4 w-4 text-slate-200" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalCount || 0}</div>
            <p className="text-xs text-slate-400 mt-1">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{registeredCount || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Status: 'Registered'</p>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active On Duty</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{onDutyCount || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Currently checked in</p>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-slate-500">Medical Team</CardTitle>
             <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{roleCounts['Medical Aid'] || 0}</div>
             <p className="text-xs text-slate-500 mt-1">Critical personnel</p>
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Activity */}
        <Card className="col-span-4 rounded-[24px] border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {recentVolunteers?.map((v, i) => (
                    <div key={i} className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 border border-slate-200">
                             {v.full_name.charAt(0)}
                        </div>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none text-slate-900">{v.full_name}</p>
                            <p className="text-xs text-slate-500">{v.preferred_roles?.[0]}</p>
                        </div>
                        <div className="ml-auto font-medium text-xs bg-slate-50 px-2 py-1 rounded-md text-slate-500">
                            {new Date(v.created_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
             </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="col-span-3 rounded-[24px] border-slate-100 shadow-sm">
            <CardHeader>
                <CardTitle>Top Roles Requests</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topRoles.map(([role, count]) => (
                        <div key={role} className="flex items-center">
                            <div className="w-full">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-700">{role}</span>
                                    <span className="text-xs font-bold text-slate-900">{count}</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div 
                                        className="h-full bg-slate-900 rounded-full" 
                                        style={{ width: `${(count / (totalCount || 1)) * 100}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  )
}
