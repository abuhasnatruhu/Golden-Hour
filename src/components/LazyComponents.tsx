import dynamic from 'next/dynamic'

// Lazy load heavy components that are not immediately visible
export const LazyEnhancedInteractiveMap = dynamic(
  () => import('@/src/components/enhanced-interactive-map'),
  { 
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false 
  }
)

export const LazyPhotographyInspiration = dynamic(
  () => import('@/src/components/photography-inspiration'),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true 
  }
)

export const LazyPhotographyCalendar = dynamic(
  () => import('@/src/components/photography-calendar'),
  { 
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true 
  }
)

export const LazyAdvancedPhotographyFeatures = dynamic(
  () => import('@/src/components/advanced-photography-features'),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true 
  }
)

export const LazyLocationBasedFAQ = dynamic(
  () => import('@/src/components/location-based-faq').then(mod => ({ default: mod.LocationBasedFAQ })),
  { 
    loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true 
  }
)