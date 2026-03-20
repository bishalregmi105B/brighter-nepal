// Student Profile Page
// Edit profile info, change password, notification preferences, plan status
import { User, MapPin, Mail, Lock, Bell, CreditCard, Camera } from 'lucide-react'
import { currentUser } from '@/lib/data/mockUsers'

export default function ProfilePage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-headline font-extrabold text-[#1a1a4e]">Your Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your personal information and preferences</p>
      </div>

      {/* Avatar + Name */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_12px_32px_rgba(25,28,30,0.04)] flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            <User className="w-12 h-12 text-on-primary-fixed" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-on-primary-container text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-headline font-black text-[#1a1a4e]">{currentUser.name}</h2>
          <p className="text-slate-500 mt-1">{currentUser.email}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold px-3 py-1 rounded-full">
              {currentUser.plan === 'paid' ? 'Pro Plan' : 'Free Plan'}
            </span>
            <span className="bg-surface-container text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
              Rank #{currentUser.rank}
            </span>
          </div>
        </div>
        <button className="flex-shrink-0 px-5 py-2 rounded-xl border border-outline-variant/20 text-sm font-bold text-on-surface hover:bg-surface-container transition-colors">
          Save Changes
        </button>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_12px_32px_rgba(25,28,30,0.04)] space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-on-primary-container" />
          <h3 className="font-headline font-bold text-on-surface text-lg">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: 'Full Name',        value: currentUser.name,  type: 'text',  Icon: User    },
            { label: 'Email Address',    value: currentUser.email, type: 'email', Icon: Mail    },
            { label: 'Location',         value: 'Kathmandu, Nepal', type: 'text', Icon: MapPin  },
            { label: 'Stream / Faculty', value: 'Science (+2)',    type: 'text',  Icon: null    },
          ].map(({ label, value, type, Icon }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">{label}</label>
              <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />}
                <input
                  type={type}
                  defaultValue={value}
                  className={`w-full py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface text-sm ${Icon ? 'pl-9 pr-4' : 'px-4'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_12px_32px_rgba(25,28,30,0.04)] space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-on-primary-container" />
          <h3 className="font-headline font-bold text-on-surface text-lg">Change Password</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-on-primary-container/20 text-on-surface placeholder:text-outline text-sm"
              />
            </div>
          ))}
        </div>
        <button className="bg-on-primary-container text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all">
          Update Password
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_12px_32px_rgba(25,28,30,0.04)] space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-on-primary-container" />
          <h3 className="font-headline font-bold text-on-surface text-lg">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Live Class Reminders',      sub: 'Get notified 15 minutes before a class starts',  defaultOn: true  },
            { label: 'Weekly Test Announcements', sub: 'Alerts when a new test is scheduled or opened',   defaultOn: true  },
            { label: 'Result Releases',           sub: 'Know when your test results are published',       defaultOn: true  },
            { label: 'Group Announcements',       sub: 'Admin messages from your study groups',           defaultOn: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
              <div>
                <p className="font-bold text-sm text-on-surface">{item.label}</p>
                <p className="text-xs text-outline mt-0.5">{item.sub}</p>
              </div>
              <button className={`relative w-11 h-6 rounded-full transition-colors ${item.defaultOn ? 'bg-on-primary-container' : 'bg-surface-container-high'}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${item.defaultOn ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Plan */}
      <div className="bg-[#1a1a4e] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-on-primary-container/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-on-primary-container" />
          </div>
          <div>
            <p className="font-black text-lg">
              {currentUser.plan === 'paid' ? 'Pro Plan Active' : 'Upgrade to Pro'}
            </p>
            <p className="text-white/60 text-sm">
              {currentUser.plan === 'paid' ? 'Renews Feb 12, 2025 · NPR 12,000/yr' : 'Unlock all model sets, live classes & premium groups'}
            </p>
          </div>
        </div>
        <button className="bg-on-primary-container text-white px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-on-primary-container/20 flex-shrink-0">
          {currentUser.plan === 'paid' ? 'Manage Subscription' : 'Upgrade Now'}
        </button>
      </div>
    </div>
  )
}
