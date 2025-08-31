"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export function DebugTest() {
  // Force immediate console output on every render
  console.log("🔥🔥🔥 DebugTest IMMEDIATE LOG - RENDER START", Date.now())
  console.warn("🔥🔥🔥 DebugTest IMMEDIATE WARNING", Date.now())
  console.error("🔥🔥🔥 DebugTest IMMEDIATE ERROR", Date.now())
  
  // Try alert to test JavaScript execution
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      alert("DebugTest component is working! Check console for logs.")
    }, 1000)
  }
  
  useEffect(() => {
    console.log("🔥🔥🔥 DebugTest useEffect TRIGGERED", Date.now())
    console.log("🔥🔥🔥 DebugTest component mounted successfully!")
  }, [])
  
  const searchParams = useSearchParams()
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'red',
      color: 'white',
      padding: '10px',
      zIndex: 9999,
      fontSize: '11px',
      maxWidth: '300px',
      borderRadius: '4px'
    }}>
      <div><strong>DEBUG TEST</strong></div>
      <div>Component Loaded: ✅</div>
      <div>Current Time: {new Date().toLocaleTimeString()}</div>
      <div>Search Params: {searchParams?.toString() || 'none'}</div>
    </div>
  )
}