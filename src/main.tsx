import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/global.scss'
import './styles/ripple.scss'
import { Provider } from 'react-redux'
import { store } from './app/store'
import './i18n';

import { ToastProvider } from './context/ToastContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <HashRouter>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </HashRouter>
        </Provider>
    </React.StrictMode>,
)
