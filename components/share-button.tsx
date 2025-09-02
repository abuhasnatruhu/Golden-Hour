"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Share2, Copy, Facebook, Twitter, MessageCircle, Mail, Check } from "lucide-react"
// Using simple alerts instead of toast for better compatibility

interface ShareButtonProps {
  url?: string
  title?: string
  description?: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
}

export default function ShareButton({
  url,
  title = "Golden Hour Calculator",
  description = "Calculate perfect golden hour times for photography",
  className = "",
  variant = "outline",
  size = "sm",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  // Get current URL if not provided
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      alert("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert("Failed to copy link")
    }
  }

  const shareOptions = [
    {
      name: "Copy Link",
      icon: copied ? Check : Copy,
      action: copyToClipboard,
      color: copied ? "text-green-600" : "text-gray-600",
    },
    {
      name: "Facebook",
      icon: Facebook,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank"),
      color: "text-blue-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, "_blank"),
      color: "text-sky-500",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      action: () => window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, "_blank"),
      color: "text-green-600",
    },
    {
      name: "Email",
      icon: Mail,
      action: () =>
        window.open(`mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${shareUrl}`, "_blank"),
      color: "text-gray-600",
    },
  ]

  // Native Web Share API fallback
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
        console.log("Share cancelled")
      }
    }
  }

  // Check if native sharing is available
  const hasNativeShare = typeof navigator !== "undefined" && navigator.share

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {hasNativeShare && (
          <>
            <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
              <Share2 className="w-4 h-4 mr-2 text-primary" />
              Share...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {shareOptions.map((option) => {
          const IconComponent = option.icon
          return (
            <DropdownMenuItem key={option.name} onClick={option.action} className="cursor-pointer">
              <IconComponent className={`w-4 h-4 mr-2 ${option.color}`} />
              {option.name}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Quick copy button component for inline use
export function QuickCopyButton({
  url,
  className = "",
  size = "sm",
}: {
  url?: string
  className?: string
  size?: "sm" | "default" | "lg"
}) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      alert("Link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert("Failed to copy link")
    }
  }

  return (
    <Button variant="outline" size={size} onClick={copyToClipboard} className={className}>
      {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  )
}
