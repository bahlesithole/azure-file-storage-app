import React from 'react'
import ReactDOM from 'react-dom/client'
import AzureFileStorageSystem from './cloudfile.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AzureFileStorageSystem />
  </React.StrictMode>,
)
