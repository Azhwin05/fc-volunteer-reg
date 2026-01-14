'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Download, Search, Filter, RefreshCw, CheckCircle2, Clock, MapPin, Phone, Loader2, User } from "lucide-react"

// Define limited type for UI
type Volunteer = {
  id: string
  reference_id: string
  full_name: string
  email: string
  phone: string
  age: number
  status: 'Registered' | 'Assigned' | 'On Duty' | 'Completed' | 'Rejected'
  preferred_roles: string[]
  created_at: string
  location: string
  assigned_role?: string
}

export default function VolunteerDashboard() {
  const [data, setData] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    // Fetch data using the client - RLS policies must allow this!
    const { data: volunteers, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching data:', error)
      // Optional: Show toast error here
    } else {
      setData(volunteers as Volunteer[])
    }
    setLoading(false)
  }

  const exportCSV = () => {
    const headers = ["Reference ID", "Name", "Email", "Phone", "Age", "Roles", "Status", "Location", "Registered At"]
    const csvContent = [
      headers.join(","),
      ...data.map(v => [
        v.reference_id,
        `"${v.full_name}"`,
        v.email,
        v.phone,
        v.age,
        `"${v.preferred_roles?.join('; ')}"`,
        v.status,
        `"${v.location}"`,
        v.created_at
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `volunteers_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  const filteredData = data.filter(v => {
    const matchesSearch = 
      v.full_name.toLowerCase().includes(search.toLowerCase()) || 
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search) ||
      v.reference_id.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(v.status)

    return matchesSearch && matchesStatus
  })

  // Status Badge Helper - Clean Pill Styles
  const getStatusBadge = (status: string) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-semibold border"
    switch(status) {
      case 'Registered': return <span className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}>Registered</span>
      case 'Assigned': return <span className={`${baseClass} bg-indigo-50 text-indigo-700 border-indigo-200`}>Assigned</span>
      case 'On Duty': return <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>On Duty</span>
      case 'Completed': return <span className={`${baseClass} bg-slate-100 text-slate-700 border-slate-200`}>Completed</span>
      case 'Rejected': return <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>Rejected</span>
      default: return <span className={`${baseClass} bg-slate-50 text-slate-600 border-slate-200`}>{status}</span>
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-slate-900">Volunteers</h2>
           <p className="text-slate-500 mt-1">Total Registrations: {data.length}</p>
        </div>
        <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={fetchData} className="rounded-full h-10 px-4 border-slate-200 hover:bg-slate-50 text-slate-600">
                <RefreshCw className="w-4 h-4 mr-2"/> Sync
            </Button>
            <Button size="sm" onClick={exportCSV} className="rounded-full h-10 px-6 bg-black hover:bg-zinc-800 text-white shadow-sm">
                <Download className="w-4 h-4 mr-2"/> Export Data
            </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white rounded-[24px] overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:w-96">
                   <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                   <Input 
                      placeholder="Search by name, ID or phone..." 
                      className="pl-11 h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all text-base" 
                      value={search}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                   />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 rounded-xl px-4 border-slate-200 text-slate-600 hover:bg-slate-50">
                      <Filter className="mr-2 h-4 w-4" /> Filter Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                    <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Filter by Status</DropdownMenuLabel>
                    {['Registered', 'Assigned', 'On Duty', 'Completed', 'Rejected'].map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilter.includes(status)}
                        onCheckedChange={(checked: boolean) => {
                          setStatusFilter(prev => 
                            checked ? [...prev, status] : prev.filter(s => s !== status)
                          )
                        }}
                        className="rounded-lg cursor-pointer"
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        
        <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="w-[140px] pl-6 h-14 text-xs font-bold uppercase tracking-wider text-slate-400">Ref ID</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase tracking-wider text-slate-400">Volunteer</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase tracking-wider text-slate-400">Roles</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase tracking-wider text-slate-400">Location</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
                  <TableHead className="text-right pr-6 h-14 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                     <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin mb-2 text-slate-300"/> 
                            <span className="text-sm">Fetching records...</span>
                        </div>
                     </TableCell>
                   </TableRow>
                ) : filteredData.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        No volunteers found matching your criteria.
                     </TableCell>
                   </TableRow>
                ) : (
                  filteredData.map((volunteer) => (
                    <TableRow key={volunteer.id} className="group hover:bg-slate-50/50 border-b border-slate-50 last:border-0 transition-colors">
                      <TableCell className="pl-6 py-4 font-mono font-bold text-xs text-slate-500 group-hover:text-slate-900 transition-colors">
                          {volunteer.reference_id}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mr-3">
                                {volunteer.full_name.charAt(0)}
                            </div>
                           <div className="flex flex-col">
                           <span className="font-semibold text-slate-900 text-sm">{volunteer.full_name}</span>
                           <span className="text-xs text-slate-500">{volunteer.email}</span>
                        </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                         <div className="flex flex-wrap gap-1.5">
                            {volunteer.preferred_roles.slice(0, 2).map(r => (
                               <span key={r} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">{r}</span>
                            ))}
                            {volunteer.preferred_roles.length > 2 && <span className="text-[10px] text-slate-400 font-medium p-1">+{volunteer.preferred_roles.length - 2}</span>}
                         </div>
                      </TableCell>
                      <TableCell className="py-4">
                         <div className="flex items-center text-slate-600 text-xs font-medium">
                            <MapPin className="w-3 h-3 mr-1.5 text-slate-400" /> {volunteer.location}
                         </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(volunteer.status)}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-200">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl p-2 w-48">
                            <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Manage</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(volunteer.email)} className="rounded-lg cursor-pointer">
                               Copy Email
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => navigator.clipboard.writeText(volunteer.phone)} className="rounded-lg cursor-pointer">
                               Copy Phone
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-blue-600 rounded-lg cursor-pointer font-medium">Assign Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 rounded-lg cursor-pointer font-medium">Reject</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </div>
      </Card>
    </div>
  )
}
