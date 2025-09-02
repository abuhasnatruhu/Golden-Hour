"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Globe, 
  Link, 
  BarChart3, 
  Search, 
  Download, 
  Copy, 
  ExternalLink,
  TrendingUp,
  MapPin,
  Calendar,
  Settings,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface URLAnalytics {
  url: string
  location: string
  coordinates: string
  estimatedTraffic: 'high' | 'medium' | 'low'
  seoScore: number
  keywords: string[]
  competitionLevel: 'high' | 'medium' | 'low'
}

interface LocationSuggestion {
  name: string
  country: string
  state?: string
  coordinates: { lat: number; lng: number }
  url: string
}

interface SitemapEntry {
  url: string
  lastmod: string
  changefreq: string
  priority: string
}

export function URLManagementDashboard() {
  const [urls, setUrls] = useState<string[]>([])
  const [analytics, setAnalytics] = useState<URLAnalytics[]>([])
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [sitemap, setSitemap] = useState<SitemapEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<'seo' | 'coordinates'>('seo')
  const [includeDate, setIncludeDate] = useState(false)
  const [includePopularOnly, setIncludePopularOnly] = useState(true)
  const [customLocations, setCustomLocations] = useState('')

  const generateURLs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'generate',
        format: selectedFormat,
        includeDate: includeDate.toString(),
        includePopularOnly: includePopularOnly.toString(),
        limit: '100'
      })

      const response = await fetch(`/api/urls?${params}`)
      const data = await response.json()

      if (data.success) {
        setUrls(data.urls)
        toast.success(`Generated ${data.count} URLs successfully`)
      } else {
        toast.error(data.error || 'Failed to generate URLs')
      }
    } catch (error) {
      toast.error('Error generating URLs')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeURLs = async () => {
    if (urls.length === 0) {
      toast.error('No URLs to analyze. Generate URLs first.')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'analyze',
        urls: urls.slice(0, 20).join(',') // Limit to first 20 URLs
      })

      const response = await fetch(`/api/urls?${params}`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.analytics)
        toast.success('URL analysis completed')
      } else {
        toast.error(data.error || 'Failed to analyze URLs')
      }
    } catch (error) {
      toast.error('Error analyzing URLs')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchLocations = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'suggestions',
        query: searchQuery,
        limit: '20'
      })

      const response = await fetch(`/api/urls?${params}`)
      const data = await response.json()

      if (data.success) {
        setSuggestions(data.suggestions)
        toast.success(`Found ${data.count} location suggestions`)
      } else {
        toast.error(data.error || 'Failed to search locations')
      }
    } catch (error) {
      toast.error('Error searching locations')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSitemap = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'sitemap',
        format: selectedFormat,
        includeDate: includeDate.toString(),
        includePopularOnly: includePopularOnly.toString()
      })

      const response = await fetch(`/api/urls?${params}`)
      const data = await response.json()

      if (data.success) {
        setSitemap(data.entries)
        toast.success(`Generated sitemap with ${data.count} entries`)
      } else {
        toast.error(data.error || 'Failed to generate sitemap')
      }
    } catch (error) {
      toast.error('Error generating sitemap')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadXMLSitemap = async () => {
    try {
      const params = new URLSearchParams({
        action: 'xml-sitemap',
        format: selectedFormat,
        includeDate: includeDate.toString(),
        includePopularOnly: includePopularOnly.toString()
      })

      const response = await fetch(`/api/urls?${params}`)
      const xmlContent = await response.text()

      const blob = new Blob([xmlContent], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sitemap.xml'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Sitemap downloaded successfully')
    } catch (error) {
      toast.error('Error downloading sitemap')
      console.error('Error:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getTrafficBadgeColor = (traffic: string) => {
    switch (traffic) {
      case 'high': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getCompetitionBadgeColor = (competition: string) => {
    switch (competition) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            URL Management Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Intelligent URL generation, analysis, and optimization for all locations
          </p>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">URL Format</Label>
              <Select value={selectedFormat} onValueChange={(value: 'seo' | 'coordinates') => setSelectedFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seo">SEO Friendly</SelectItem>
                  <SelectItem value="coordinates">Coordinates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="include-date"
                checked={includeDate}
                onCheckedChange={setIncludeDate}
              />
              <Label htmlFor="include-date">Include Date</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="popular-only"
                checked={includePopularOnly}
                onCheckedChange={setIncludePopularOnly}
              />
              <Label htmlFor="popular-only">Popular Locations Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Generator
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sitemap
          </TabsTrigger>
        </TabsList>

        {/* URL Generator Tab */}
        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                URL Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={generateURLs} disabled={loading} className="flex items-center gap-2">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
                  Generate URLs
                </Button>
                <Button onClick={analyzeURLs} disabled={loading || urls.length === 0} variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analyze URLs
                </Button>
              </div>
              
              {urls.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Generated URLs ({urls.length})</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(urls.join('\n'))}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy All
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-1">
                    {urls.slice(0, 50).map((url, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-xs truncate flex-1">{url}</span>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(url)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(url, '_blank')}
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {urls.length > 50 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        ... and {urls.length - 50} more URLs
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                URL Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analytics.length}</div>
                      <div className="text-sm text-muted-foreground">URLs Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(analytics.reduce((sum, a) => sum + a.seoScore, 0) / analytics.length)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg SEO Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {analytics.filter(a => a.estimatedTraffic === 'high').length}
                      </div>
                      <div className="text-sm text-muted-foreground">High Traffic URLs</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {analytics.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm truncate flex-1">{item.url}</span>
                          <div className="flex gap-2 ml-2">
                            <Badge className={getTrafficBadgeColor(item.estimatedTraffic)}>
                              {item.estimatedTraffic} traffic
                            </Badge>
                            <Badge className={getCompetitionBadgeColor(item.competitionLevel)}>
                              {item.competitionLevel} competition
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            SEO Score: {item.seoScore}/100
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.slice(0, 5).map((keyword, kidx) => (
                            <Badge key={kidx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analytics data available. Generate and analyze URLs first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Location Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for locations (e.g., New York, Paris, Tokyo)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocations()}
                />
                <Button onClick={searchLocations} disabled={loading || !searchQuery.trim()}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Location Suggestions ({suggestions.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{suggestion.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {suggestion.state ? `${suggestion.state}, ` : ''}{suggestion.country}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(suggestion.url, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Visit
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {suggestion.coordinates.lat.toFixed(4)}, {suggestion.coordinates.lng.toFixed(4)}
                        </div>
                        <div className="text-xs font-mono bg-muted p-1 rounded truncate">
                          {suggestion.url}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sitemap Tab */}
        <TabsContent value="sitemap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Sitemap Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={generateSitemap} disabled={loading} className="flex items-center gap-2">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                  Generate Sitemap
                </Button>
                <Button onClick={downloadXMLSitemap} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download XML
                </Button>
              </div>
              
              {sitemap.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Sitemap Entries ({sitemap.length})</h3>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {sitemap[0]?.lastmod}
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2">URL</th>
                          <th className="text-left p-2">Priority</th>
                          <th className="text-left p-2">Change Freq</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sitemap.slice(0, 100).map((entry, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2 font-mono text-xs truncate max-w-xs">{entry.url}</td>
                            <td className="p-2">{entry.priority}</td>
                            <td className="p-2">{entry.changefreq}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sitemap.length > 100 && (
                      <div className="text-center py-2 text-xs text-muted-foreground border-t">
                        ... and {sitemap.length - 100} more entries
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
