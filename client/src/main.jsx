import React from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
