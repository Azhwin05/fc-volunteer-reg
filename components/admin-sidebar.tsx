'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ScanLine, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react'

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Volunteers', href: '/admin/volunteers', icon: Users },
  { name: 'Scan Ticket', href: '/admin/scan', icon: ScanLine },
]

export default function AdminSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8 flex items-center space-x-3">
        <img src="/logo.png" alt="Ooruni" className="h-10 w-auto" />
        <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">Freedom Carnival</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Admin Portal</p>
        </div>
      </div>
      
      <div className="flex-1 px-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-black text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          )
        })}
      </div>

      <div className="px-6 mt-auto">
         <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</div>
             <div className="text-sm font-medium text-slate-900 truncate">{userEmail}</div>
         </div>
         <form action="/auth/signout" method="POST">
            <button className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 w-full px-4 py-3 rounded-xl transition-colors">
               <LogOut className="w-5 h-5" />
               <span className="font-medium text-sm">Sign Out</span>
            </button>
         </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 bg-white border-r border-slate-100">
        <NavContent />
      </aside>

      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
         <span className="font-bold text-sm">FC Admin</span>
         <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
               <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
               </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
               <NavContent />
            </SheetContent>
         </Sheet>
      </div>
    </>
  )
}
