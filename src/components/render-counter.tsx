"use client"

import React, { useRef, useEffect } from "react"

export const RenderCounter = React.memo(function RenderCounter({ name }: { name: string }) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())
  
  renderCount.current++
  
  useEffect(() => {
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now
    
    console.log(`[RENDER] ${name}: Render #${renderCount.current} (${timeSinceLastRender}ms since last)`)
    
    // Warn if rendering too frequently
    if (timeSinceLastRender < 100 && renderCount.current > 5) {
      console.warn(`[WARNING] ${name}: Rendering too frequently! Only ${timeSinceLastRender}ms since last render`)
    }
  })
  
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 left-4 bg-black/80 text-green-400 text-xs px-2 py-1 rounded font-mono z-50">
        {name}: {renderCount.current}
      </div>
    )
  }
  
  return null
})