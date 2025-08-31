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
import { Share2, Copy, Facebook, Twitter, MessageCircle, Mail, Check, Calendar, CalendarPlus } from "lucide-react"
// Using simple alerts instead of toast for better compatibility

interface ShareButtonProps {
  url?: string
  title?: string
  description?: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  eventDate?: string
  eventTime?: string
  location?: string
}

export default function ShareButton({
  url,
  title = "Golden Hour Calculator",
  description = "Calculate perfect golden hour times for photography",
  className = "",
  variant = "outline",
  size = "sm",
  eventDate,
  eventTime,
  location = "",
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

  const addToGoogleCalendar = () => {
    const eventTitle = encodeURIComponent(`${title} - Golden Hour Photography`)
    const eventDescription = encodeURIComponent(
      `${description}\n\nLocation: ${location}\nCalculated using Golden Hour Calculator\n\n${shareUrl}`,
    )
    const eventLocation = encodeURIComponent(location)

    let calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDescription}&location=${eventLocation}`

    if (eventDate && eventTime) {
      const startDate = new Date(`${eventDate}T${eventTime}`)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration

      const formatGoogleDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      }

      calendarUrl += `&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`
    }

    window.open(calendarUrl, "_blank")
  }

  const addToAppleCalendar = () => {
    const eventTitle = encodeURIComponent(`${title} - Golden Hour Photography`)
    const eventDescription = encodeURIComponent(
      `${description}\n\nLocation: ${location}\nCalculated using Golden Hour Calculator\n\n${shareUrl}`,
    )

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Golden Hour Calculator//EN
BEGIN:VEVENT
UID:${Date.now()}@goldenhourcalculator.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:${decodeURIComponent(eventTitle)}
DESCRIPTION:${decodeURIComponent(eventDescription)}
LOCATION:${location}`

    if (eventDate && eventTime) {
      const startDate = new Date(`${eventDate}T${eventTime}`)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      }

      icsContent += `
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}`
    }

    icsContent += `
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "golden-hour-event.ics"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

  const calendarOptions = [
    {
      name: "Add to Google Calendar",
      icon: Calendar,
      action: addToGoogleCalendar,
      color: "text-blue-600",
    },
    {
      name: "Add to Apple Calendar",
      icon: CalendarPlus,
      action: addToAppleCalendar,
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
        <DropdownMenuSeparator />
        {calendarOptions.map((option) => {
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
