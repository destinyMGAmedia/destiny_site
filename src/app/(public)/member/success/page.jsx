'use client'
import { useRouter } from 'next/navigation'
import { Check, BookOpen, Users } from 'lucide-react'

export default function MemberSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
      <div className="card p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" 
             style={{ background: 'linear-gradient(135deg, var(--purple-600), var(--gold-500))' }}>
          <Check size={40} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Welcome to the Family!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your membership registration is complete. Your coordinator will assign your first training level when ready.
          Check your Member Portal to track your progress.
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => router.push('/growth-track')}
            className="btn-primary w-full justify-center"
          >
            <BookOpen size={20} className="mr-2" />
            Start Growth Track
          </button>
          
          <button 
            onClick={() => router.push('/member/register')}
            className="btn-outline w-full justify-center"
          >
            <Users size={20} className="mr-2" />
            View Member Portal
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          You'll receive an email with your login details and next steps.
        </p>
      </div>
    </div>
  )
}