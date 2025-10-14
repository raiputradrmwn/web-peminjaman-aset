// resources/js/app.tsx
import '../css/app.css'

import * as React from 'react'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createRoot } from 'react-dom/client'
import { initializeTheme } from './hooks/use-appearance'

// Pakai salah satu import Toaster:
// 1) langsung dari sonner:
import { Toaster } from 'sonner'
// ATAU 2) kalau pakai shadcn: npx shadcn@latest add sonner
// import { Toaster } from '@/components/ui/sonner'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) =>
    resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
  setup({ el, App, props }) {
    const root = createRoot(el)

    root.render(
      <React.StrictMode>
        {/* App Inertia */}
        <App {...props} />

        {/* Toaster global – tampilkan toast dari mana saja */}
        <Toaster
          richColors
          closeButton
          position="top-center"
        />
      </React.StrictMode>
    )
  },
  progress: {
    color: '#4B5563',
  },
})

// Set light/dark mode saat load
initializeTheme()
