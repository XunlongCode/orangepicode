import { createRoot } from 'react-dom/client'
import './index.css'
import "./i18n";
import App from './App.js'

createRoot(document.getElementById('root')!).render(
	<App />
)
