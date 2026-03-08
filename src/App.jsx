import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HandDetector from './Handdetector.jsx'

function App() {
  return (
    <div>
      <h1>Hand Gesture Test</h1>
      <HandDetector />
    </div>
  );
}

export default App;
