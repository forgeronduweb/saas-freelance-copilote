export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative">
          {/* Logo AfriLance */}
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          
          {/* Spinner */}
          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
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
