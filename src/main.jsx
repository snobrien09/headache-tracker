import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


let interventions = [
  {
    id: "water",
    name: "Drink Water",
    unit: "cups",
    amount: 0,
    max: 8,
    effectPerUnit: -1
  },
  {
    id: "tylenol",
    name: "Take Tylenol",
    unit: "pills",
    amount: 0,
    max: 2,
    effectPerUnit: -3
  }
];
