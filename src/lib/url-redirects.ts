import { LocationData } from './location-service'
import { locationDatabase, LocationEntry } from './location-database'
import { generateSEOFriendlyURL, parseLocationSlug, extractCoordinatesFromSlug } from './url-utils'

export interface RedirectRule {
  id: string
  from: string
  to: string
  type: 'permanent' | 'temporary' | 'alias'
  status: number // 301, 302, 307, 308
  reason: string
  priority: number
  conditions?: {
    userAgent?: string
    country?: string
    language?: string
    device?: 'mobile' | 'desktop' | 'tablet'
  }
  metadata: {
    createdAt: Date
    updatedAt: Date
    hitCount: number
    lastHit?: Date
  }
}

export interface URLAlias {
  id: string
  alias: string
  target: string
  description: string
  isActive: boolean
  expiresAt?: Date
  metadata: {
    createdAt: Date
    hitCount: number
    lastHit?: Date
  }
}

export interface RedirectAnalytics {
  totalRedirects: number
  redirectsByType: Record<string, number>
  topRedirects: Array<{
    from: string
    to: string
    hits: number
    conversionRate: number
  }>
  errorRate: number
  averageResponseTime: number
}

export class URLRedirectManager {
  private redirectRules: Map<string, RedirectRule> = new Map()
  private aliases: Map<string, URLAlias> = new Map()
  private analytics: Map<string, number> = new Map()

  constructor() {
    this.initializeDefaultRedirects()
    this.initializeCommonAliases()
  }

  private initializeDefaultRedirects(): void {
    const defaultRules: Omit<RedirectRule, 'id' | 'metadata'>[] = [
      {
        from: '/gh/*',
        to: '/golden-hour/*',
        type: 'permanent',
        status: 301,
        reason: 'Short URL redirect',
        priority: 1
      },
      {
        from: '/calculator/*',
        to: '/golden-hour/*',
        type: 'permanent',
        status: 301,
        reason: 'Legacy URL redirect',
        priority: 2
      },
      {
        from: '/golden-hour/search',
        to: '/golden-hour',
        type: 'permanent',
        status: 301,
        reason: 'Simplified search URL',
        priority: 3
      },
      {
        from: '/api/v1/*',
        to: '/api/*',
        type: 'permanent',
        status: 301,
        reason: 'API version consolidation',
        priority: 4
      }
    ]

    defaultRules.forEach((rule, index) => {
      const id = `default-${index + 1}`
      this.redirectRules.set(id, {
        ...rule,
        id,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          hitCount: 0
        }
      })
    })
  }

  private initializeCommonAliases(): void {
    const commonAliases: Omit<URLAlias, 'id' | 'metadata'>[] = [
      {
        alias: '/nyc',
        target: '/golden-hour/new-york-40.7128,-74.0060',
        description: 'New York City shortcut',
        isActive: true
      },
      {
        alias: '/london',
        target: '/golden-hour/london-51.5074,-0.1278',
        description: 'London shortcut',
        isActive: true
      },
      {
        alias: '/paris',
        target: '/golden-hour/paris-48.8566,2.3522',
        description: 'Paris shortcut',
        isActive: true
      },
      {
        alias: '/tokyo',
        target: '/golden-hour/tokyo-35.6762,139.6503',
        description: 'Tokyo shortcut',
        isActive: true
      },
      {
        alias: '/sydney',
        target: '/golden-hour/sydney--33.8688,151.2093',
        description: 'Sydney shortcut',
        isActive: true
      }
    ]

    commonAliases.forEach((alias, index) => {
      const id = `alias-${index + 1}`
      this.aliases.set(alias.alias, {
        ...alias,
        id,
        metadata: {
          createdAt: new Date(),
          hitCount: 0
        }
      })
    })
  }

  // Check if a URL needs redirection
  checkRedirect(url: string, userAgent?: string, country?: string): RedirectRule | null {
    // First check aliases
    const alias = this.aliases.get(url)
    if (alias && alias.isActive && (!alias.expiresAt || alias.expiresAt > new Date())) {
      // Convert alias to redirect rule
      return {
        id: alias.id,
        from: url,
        to: alias.target,
        type: 'alias',
        status: 302,
        reason: alias.description,
        priority: 0,
        metadata: {
          createdAt: alias.metadata.createdAt,
          updatedAt: new Date(),
          hitCount: alias.metadata.hitCount,
          lastHit: new Date()
        }
      }
    }

    // Check redirect rules
    const sortedRules = Array.from(this.redirectRules.values())
      .sort((a, b) => a.priority - b.priority)

    for (const rule of sortedRules) {
      if (this.matchesPattern(url, rule.from)) {
        // Check conditions if they exist
        if (rule.conditions) {
          if (rule.conditions.userAgent && userAgent && !userAgent.includes(rule.conditions.userAgent)) {
            continue
          }
          if (rule.conditions.country && country && rule.conditions.country !== country) {
            continue
          }
        }

        // Transform the URL
        const transformedTo = this.transformURL(url, rule.from, rule.to)
        return {
          ...rule,
          to: transformedTo,
          metadata: {
            ...rule.metadata,
            hitCount: rule.metadata.hitCount + 1,
            lastHit: new Date()
          }
        }
      }
    }

    return null
  }

  private matchesPattern(url: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '\\?')
      .replace(/\./g, '\\.')
    
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(url)
  }

  private transformURL(url: string, fromPattern: string, toPattern: string): string {
    // Handle wildcard transformations
    if (fromPattern.includes('*') && toPattern.includes('*')) {
      const fromRegex = fromPattern.replace(/\*/g, '(.*)')
      const regex = new RegExp(`^${fromRegex}$`)
      const match = url.match(regex)
      
      if (match) {
        let result = toPattern
        for (let i = 1; i < match.length; i++) {
          result = result.replace('*', match[i])
        }
        return result
      }
    }
    
    return toPattern
  }

  // Add a new redirect rule
  addRedirectRule(rule: Omit<RedirectRule, 'id' | 'metadata'>): string {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newRule: RedirectRule = {
      ...rule,
      id,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        hitCount: 0
      }
    }
    
    this.redirectRules.set(id, newRule)
    return id
  }

  // Add a new alias
  addAlias(alias: Omit<URLAlias, 'id' | 'metadata'>): string {
    const id = `alias-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newAlias: URLAlias = {
      ...alias,
      id,
      metadata: {
        createdAt: new Date(),
        hitCount: 0
      }
    }
    
    this.aliases.set(alias.alias, newAlias)
    return id
  }

  // Generate smart redirects for location variations
  generateLocationRedirects(location: LocationData | LocationEntry): RedirectRule[] {
    const rules: RedirectRule[] = []
    const locationName = this.getLocationName(location)
    const coordinates = this.getCoordinates(location)
    
    // Generate variations
    const variations = this.generateLocationVariations(locationName)
    const baseUrl = generateSEOFriendlyURL({
      lat: coordinates.lat,
      lng: coordinates.lng,
      locationName
    })

    variations.forEach((variation, index) => {
      const rule: RedirectRule = {
        id: `location-${Date.now()}-${index}`,
        from: `/golden-hour/${variation}`,
        to: `/golden-hour/${baseUrl}`,
        type: 'permanent',
        status: 301,
        reason: `Location name variation redirect`,
        priority: 10 + index,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          hitCount: 0
        }
      }
      rules.push(rule)
    })

    return rules
  }

  private generateLocationVariations(locationName: string): string[] {
    const variations: string[] = []
    const slug = parseLocationSlug(locationName)
    
    // Common variations
    variations.push(
      locationName.toLowerCase().replace(/\s+/g, '-'),
      locationName.toLowerCase().replace(/\s+/g, '_'),
      locationName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      locationName.replace(/\s+/g, ''),
      slug.toLowerCase(),
      slug.toUpperCase(),
      // Remove common words
      locationName.replace(/\b(city|town|village|county|state|province)\b/gi, '').trim().replace(/\s+/g, '-')
    )

    // Remove duplicates and empty strings
    return [...new Set(variations)].filter(v => v.length > 0)
  }

  private getLocationName(location: LocationData | LocationEntry): string {
    if ('name' in location) {
      return location.name
    }
    return location.city
  }

  private getCoordinates(location: LocationData | LocationEntry): { lat: number; lng: number } {
    if ('coordinates' in location) {
      return { lat: location.coordinates.lat, lng: location.coordinates.lng }
    }
    return { lat: location.lat, lng: location.lon }
  }

  // Bulk generate redirects for popular locations
  generateBulkLocationRedirects(): RedirectRule[] {
    const locations = locationDatabase.getPopularLocations(50)
    const allRules: RedirectRule[] = []

    locations.forEach(location => {
      const rules = this.generateLocationRedirects(location)
      allRules.push(...rules)
    })

    // Add rules to the manager
    allRules.forEach(rule => {
      this.redirectRules.set(rule.id, rule)
    })

    return allRules
  }

  // Get redirect analytics
  getAnalytics(): RedirectAnalytics {
    const rules = Array.from(this.redirectRules.values())
    const aliases = Array.from(this.aliases.values())
    
    const totalRedirects = rules.reduce((sum, rule) => sum + rule.metadata.hitCount, 0) +
                          aliases.reduce((sum, alias) => sum + alias.metadata.hitCount, 0)
    
    const redirectsByType = rules.reduce((acc, rule) => {
      acc[rule.type] = (acc[rule.type] || 0) + rule.metadata.hitCount
      return acc
    }, {} as Record<string, number>)

    const topRedirects = rules
      .filter(rule => rule.metadata.hitCount > 0)
      .sort((a, b) => b.metadata.hitCount - a.metadata.hitCount)
      .slice(0, 10)
      .map(rule => ({
        from: rule.from,
        to: rule.to,
        hits: rule.metadata.hitCount,
        conversionRate: Math.random() * 0.8 + 0.1 // Mock conversion rate
      }))

    return {
      totalRedirects,
      redirectsByType,
      topRedirects,
      errorRate: 0.02, // Mock error rate
      averageResponseTime: 45 // Mock response time in ms
    }
  }

  // Export redirect rules for server configuration
  exportForNginx(): string {
    const rules = Array.from(this.redirectRules.values())
    let config = '# Generated redirect rules for Nginx\n\n'
    
    rules.forEach(rule => {
      const status = rule.status === 301 ? 'permanent' : 'redirect'
      config += `# ${rule.reason}\n`
      config += `rewrite ^${rule.from.replace(/\*/g, '(.*)')}$ ${rule.to.replace(/\*/g, '$1')} ${status};\n\n`
    })

    return config
  }

  exportForApache(): string {
    const rules = Array.from(this.redirectRules.values())
    let config = '# Generated redirect rules for Apache\n\n'
    
    rules.forEach(rule => {
      config += `# ${rule.reason}\n`
      const pattern = rule.from.replace(/\*/g, '(.*)')
      const replacement = rule.to.replace(/\*/g, '$1')
      config += `RedirectMatch ${rule.status} ^${pattern}$ ${replacement}\n\n`
    })

    return config
  }

  exportForVercel(): string {
    const rules = Array.from(this.redirectRules.values())
    const redirects = rules.map(rule => ({
      source: rule.from,
      destination: rule.to,
      permanent: rule.status === 301
    }))

    return JSON.stringify({ redirects }, null, 2)
  }

  // Clean up expired aliases and unused rules
  cleanup(): { removedAliases: number; removedRules: number } {
    let removedAliases = 0
    let removedRules = 0

    // Remove expired aliases
    for (const [key, alias] of this.aliases.entries()) {
      if (alias.expiresAt && alias.expiresAt <= new Date()) {
        this.aliases.delete(key)
        removedAliases++
      }
    }

    // Remove unused rules (no hits in 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    for (const [key, rule] of this.redirectRules.entries()) {
      if (rule.metadata.hitCount === 0 && rule.metadata.createdAt < ninetyDaysAgo) {
        this.redirectRules.delete(key)
        removedRules++
      }
    }

    return { removedAliases, removedRules }
  }

  // Get all redirect rules
  getAllRules(): RedirectRule[] {
    return Array.from(this.redirectRules.values())
  }

  // Get all aliases
  getAllAliases(): URLAlias[] {
    return Array.from(this.aliases.values())
  }

  // Update rule hit count
  recordHit(ruleId: string): void {
    const rule = this.redirectRules.get(ruleId)
    if (rule) {
      rule.metadata.hitCount++
      rule.metadata.lastHit = new Date()
    }
  }
}

export const urlRedirectManager = new URLRedirectManager()
