import { URLManagementDashboard } from '@/components/url-management-dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'URL Management Dashboard | Golden Hour Calculator',
  description: 'Intelligent URL generation, analysis, and optimization for all locations in the Golden Hour Calculator application.',
  robots: 'noindex, nofollow' // Admin page should not be indexed
}

export default function URLManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <URLManagementDashboard />
    </div>
  )
}
