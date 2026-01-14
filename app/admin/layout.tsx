import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
        <AdminSidebar userEmail={user.email} />
        <main className="md:pl-72 pt-20 md:pt-0 min-h-screen transition-all duration-300">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {children}
            </div>
        </main>
    </div>
  )
}
