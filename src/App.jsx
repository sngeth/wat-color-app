import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import ColorPaletteExtractor from './ColorPaletteExtractor'

function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <ColorPaletteExtractor />
    </div>
  )
}

export default App
