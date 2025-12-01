import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tuition Estimator - St. Augustine Preparatory Academy',
  description: 'Estimate your family\'s tuition cost based on income and residency',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
