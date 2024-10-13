'use client'

import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()

  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme} enableSystem>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}
