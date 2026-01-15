import RegistrationForm from "@/components/registration-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, MapPin, Sparkles, Heart, Trophy, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-slate-200">
      
      {/* Minimal Header */}
      <header className="fixed top-0 w-full z-50 px-4 md:px-6 py-4 md:py-6 flex justify-center pointer-events-none">
        <nav className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-sm rounded-full px-4 py-2 md:px-6 md:py-3 flex items-center space-x-4 md:space-x-6 pointer-events-auto">
            <div className="flex items-center space-x-2 md:space-x-3">
               <img src="/logo.png" alt="Ooruni Foundation" className="h-6 md:h-8 w-auto" />
               <span className="font-bold text-xs md:text-sm tracking-wide hidden sm:inline">FREEDOM CARNIVAL</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            
            <Dialog>
              <DialogTrigger asChild>
                 <button className="text-xs md:text-sm text-slate-500 hover:text-black transition-colors font-medium">Event Details</button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] w-[95vw] md:w-full overflow-hidden p-0 rounded-[24px] md:rounded-[32px] border-0 shadow-2xl bg-white flex flex-col">
                {/* Header Image Area */}
                <div className="relative h-32 md:h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 shrink-0">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 text-white">
                        <div className="flex items-center space-x-2 mb-1.5 md:mb-2 opacity-90">
                            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Annual Event</span>
                        </div>
                        <DialogTitle className="text-xl md:text-3xl font-bold tracking-tight">Freedom Carnival 2026</DialogTitle>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8">
                   <DialogDescription className="text-sm md:text-lg text-slate-600 leading-relaxed font-light">
                     An inclusive celebration by <b>Ooruni Foundation</b> in Chennai, celebrating children with special needs through fun games, talent showcases, and parent workshops.
                   </DialogDescription>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                       <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center border border-slate-100">
                           <Users className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 mx-auto mb-1.5 md:mb-2" />
                           <div className="text-xl md:text-2xl font-bold text-slate-900">1,000+</div>
                           <div className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attendees</div>
                       </div>
                       <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center border border-slate-100">
                           <Trophy className="w-5 h-5 md:w-6 md:h-6 text-orange-500 mx-auto mb-1.5 md:mb-2" />
                           <div className="text-xl md:text-2xl font-bold text-slate-900">20+</div>
                           <div className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Activities</div>
                       </div>
                       <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center border border-slate-100 col-span-2 md:col-span-1">
                           <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-500 mx-auto mb-1.5 md:mb-2" />
                           <div className="text-xl md:text-2xl font-bold text-slate-900">8+</div>
                           <div className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Years Impact</div>
                       </div>
                   </div>

                   {/* Details Section */}
                   <div className="space-y-3 md:space-y-4">
                       <h4 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Event Highlights</h4>
                       <ul className="space-y-2 md:space-y-3">
                           <li className="flex items-start text-xs md:text-sm text-slate-600">
                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 md:mt-2 mr-2 md:mr-3 shrink-0" />
                               <span><b>Key Activities:</b> Indoor & outdoor games, entertainment, and workshops.</span>
                           </li>
                            <li className="flex items-start text-xs md:text-sm text-slate-600">
                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 md:mt-2 mr-2 md:mr-3 shrink-0" />
                               <span><b>Impact:</b> Fosters inclusion and supports rehabilitation.</span>
                           </li>
                       </ul>
                   </div>

                   {/* Location Card */}
                   <div className="bg-slate-900 text-white p-4 md:p-5 rounded-xl md:rounded-2xl flex flex-col md:flex-row gap-3 md:gap-4 md:items-center justify-between">
                       <div className="space-y-1">
                           <div className="flex items-center space-x-2 text-indigo-300">
                               <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                               <span className="text-[10px] md:text-xs font-bold uppercase">February 22, 2026</span>
                           </div>
                           <div className="flex items-center space-x-2">
                               <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                               <span className="text-sm md:text-base font-medium">Vels University, Chennai</span>
                           </div>
                       </div>
                       <div className="text-[10px] md:text-xs text-slate-400 max-w-[150px] leading-snug">
                           All volunteers must report by 7:00 AM on event day.
                       </div>
                   </div>
                </div>
              </DialogContent>
            </Dialog>

        </nav>
      </header>

      <div className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 md:space-y-6 mb-10 md:mb-16 animate-in slide-in-from-bottom-8 duration-700 fade-in">
           <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-3 py-1 mb-2 md:mb-4">
              <span className="bg-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">NEW</span>
              <span className="text-[10px] md:text-xs font-medium text-slate-600">Volunteer Registrations Open 2026</span>
           </div>
           
           <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
             Join the movement. <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-800">Make an impact.</span>
           </h1>
           
           <p className="text-base md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed px-4">
             Be part of the Freedom Carnival. Sign up today to help us organize, manage, and deliver an unforgettable experience.
           </p>
        </div>
        
        {/* Form Container */}
        <RegistrationForm />
        
        <footer className="mt-16 md:mt-24 text-center text-slate-400 text-xs md:text-sm pb-8">
           <p>© 2026 Ooruni Foundation. Built for Community.</p>
        </footer>

      </div>
    </main>
  )
}
