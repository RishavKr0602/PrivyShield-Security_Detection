"use client"

import { Shield, Github, Globe, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Cypheron</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure messaging, phishing protection, and encrypted storage for the next generation.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Encrypted Messaging</li>
              <li>Phishing Detection</li>
              <li>Secure Vault</li>
              <li>Privacy First</li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h4 className="font-semibold mb-4">Security</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>AES-256 Encryption</li>
              <li>Zero Server Storage</li>
              <li>Local Data Only</li>
              <li>Open Source</li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Github className="h-4 w-4" />
                <span>Source Code</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Documentation</span>
              </li>
              <li>Privacy Policy</li>
              <li>Security Audit</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2024 Cypheron. Built with privacy in mind.</p>
          <p className="text-sm text-muted-foreground flex items-center space-x-1 mt-4 sm:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>for Gen Z security</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
