'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ 
  className = "", 
  variant = "glass", // glass, outline, solid
  label = "Back" 
}) {
  const router = useRouter()

  const variants = {
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
    outline: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    solid: "bg-purple-900 text-white hover:bg-purple-800 shadow-md"
  }

  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-lg active:scale-95"
  
  return (
    <button 
      onClick={() => router.back()}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}
