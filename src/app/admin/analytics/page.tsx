import { Metadata } from 'next'
import AnalyticsDashboard from '@/components/analytics-dashboard'

export const metadata: Metadata = {
  title: 'URL Analytics Dashboard - Golden Hour Calculator Admin',
  description: 'Monitor and analyze performance of location-based URLs',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AnalyticsDashboard />
    </div>
  )
}
