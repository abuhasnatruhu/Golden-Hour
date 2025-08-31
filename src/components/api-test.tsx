"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ApiTest() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testUnsplash = async () => {
    setLoading(true)
    try {
      console.log("[v0] Testing Unsplash API directly...")
      const response = await fetch("/api/images/unsplash?query=dhaka&page=1&per_page=5")
      const data = await response.json()
      console.log("[v0] Unsplash direct test result:", data)
      setResults({ type: "unsplash", data, status: response.status })
    } catch (error) {
      console.error("[v0] Unsplash test error:", error)
      setResults({ type: "unsplash", error: error instanceof Error ? error.message : String(error) })
    }
    setLoading(false)
  }

  const testPexels = async () => {
    setLoading(true)
    try {
      console.log("[v0] Testing Pexels API directly...")
      const response = await fetch("/api/images/pexels?query=dhaka&page=1&per_page=5")
      const data = await response.json()
      console.log("[v0] Pexels direct test result:", data)
      setResults({ type: "pexels", data, status: response.status })
    } catch (error) {
      console.error("[v0] Pexels test error:", error)
      setResults({ type: "pexels", error: error instanceof Error ? error.message : String(error) })
    }
    setLoading(false)
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-4">API Test Panel</h3>
      <div className="flex gap-2 mb-4">
        <Button onClick={testUnsplash} disabled={loading}>
          Test Unsplash API
        </Button>
        <Button onClick={testPexels} disabled={loading}>
          Test Pexels API
        </Button>
      </div>

      {loading && <p>Testing API...</p>}

      {results && (
        <div className="mt-4">
          <h4 className="font-medium">Results for {results.type}:</h4>
          <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
