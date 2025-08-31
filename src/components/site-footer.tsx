import { Mail, Phone, MapPin, Clock, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="/color-experts-logo-new.png" alt="Color Experts Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold">COLOR EXPERTS</h3>
                <p className="text-sm text-slate-300">Golden Hour Calculator</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Professional photography timing tools for perfect golden hour and blue hour calculations. Plan your shoots
              with precision and capture stunning images with optimal lighting.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#search" className="text-slate-300 hover:text-white transition-colors">
                  Golden Hour Calculator
                </a>
              </li>
              <li>
                <a href="#map" className="text-slate-300 hover:text-white transition-colors">
                  Interactive Sun Map
                </a>
              </li>
              <li>
                <a href="#calendar" className="text-slate-300 hover:text-white transition-colors">
                  Photography Calendar
                </a>
              </li>
              <li>
                <a href="#inspiration" className="text-slate-300 hover:text-white transition-colors">
                  Photo Inspiration
                </a>
              </li>
              <li>
                <a href="#cities" className="text-slate-300 hover:text-white transition-colors">
                  Top Photography Cities
                </a>
              </li>
            </ul>
          </div>

          {/* Photography Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.colorexpertsbd.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Photo Editing & Retouching
                </a>
              </li>
              <li>
                <a
                  href="https://www.colorexpertsbd.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Color Correction
                </a>
              </li>
              <li>
                <a
                  href="https://www.colorexpertsbd.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Background Removal
                </a>
              </li>
              <li>
                <a
                  href="https://www.colorexpertsbd.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Image Enhancement
                </a>
              </li>
              <li>
                <a
                  href="https://www.colorexpertsbd.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Professional Consultation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get In Touch</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href="mailto:info@colorexpertsbd.com" className="text-slate-300 hover:text-white transition-colors">
                  info@colorexpertsbd.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">+880 1XXX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">24/7 Support Available</span>
              </div>
            </div>

            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 mt-4"
            >
              <a href="https://www.colorexpertsbd.com/" target="_blank" rel="noopener noreferrer">
                Visit Our Main Site
              </a>
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400">
              © {currentYear} Color Experts BD. All rights reserved. | Golden Hour Calculator Tool
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for photographers worldwide</span>
            </div>
          </div>

          <div className="text-center mt-4 text-xs text-slate-500">
            <p>
              Professional photography timing calculations • Real-time sun position tracking • Global location support
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
