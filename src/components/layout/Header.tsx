import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between px-6 flex-shrink-0" style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.94) 100%)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(59,130,246,0.2)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 32px rgba(0,0,0,0.08)',
    }}>
      <div>
        {title && <h1 className="text-lg font-semibold text-slate-900">{title}</h1>}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.75) 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
          color: '#DC2626',
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  )
}
