export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative">
          {/* Logo Tuma */}
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-xl">T</span>
          </div>
          
          {/* Spinner */}
          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
        
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Chargement...
        </h2>
        
        <p className="text-slate-600">
          Veuillez patienter
        </p>
      </div>
    </div>
  )
}
