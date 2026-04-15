export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ivory)' }}>
      <div className="text-center">
        {/* Animated DMGA Logo Loader */}
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--purple-200) transparent transparent transparent' }}
          ></div>
          <div
            className="absolute inset-2 w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ 
              borderColor: 'var(--gold-300) transparent transparent transparent',
              animationDirection: 'reverse',
              animationDuration: '1.5s'
            }}
          ></div>
        </div>
        
        <h2
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
        >
          Loading...
        </h2>
        
        <p className="text-sm text-gray-500">
          Getting everything ready for you
        </p>
      </div>
    </div>
  )
}