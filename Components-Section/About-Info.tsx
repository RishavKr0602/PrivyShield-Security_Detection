"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, MessageCircle, Search, Lock, Globe, Users, Zap } from "lucide-react"

export function About() {
  const features = [
    {
      icon: MessageCircle,
      title: "End-to-End Encrypted Messaging",
      description: "Peer-to-peer communication with AES-256 encryption. Messages never touch our servers.",
      tech: ["WebRTC", "AES-256", "P2P"],
    },
    {
      icon: Search,
      title: "AI-Powered Phishing Detection",
      description: "Advanced machine learning algorithms detect malicious links and protect you from scams.",
      tech: ["Machine Learning", "Domain Analysis", "Pattern Recognition"],
    },
    {
      icon: Lock,
      title: "Local Encrypted Vault",
      description:
        "Store passwords and sensitive data locally with client-side encryption. Your data never leaves your device.",
      tech: ["IndexedDB", "AES-256", "Local Storage"],
    },
  ]

  const techStack = [
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Framework" },
    { name: "TypeScript", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "WebRTC", category: "Communication" },
    { name: "IndexedDB", category: "Storage" },
    { name: "Crypto API", category: "Encryption" },
  ]

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            <span>About Cypheron</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Built for the Next Generation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Cypheron (SecureLink Vault) is a comprehensive security platform designed specifically for Gen Z and
            students who prioritize privacy, security, and modern user experience.
          </p>
        </div>

        {/* Mission */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              To provide young people with the tools they need to stay secure online without compromising on usability
              or privacy. We believe security should be accessible, transparent, and completely under your control.
            </p>
          </div>
        </Card>

        {/* Features Deep Dive */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-6 h-full">
                  <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.tech.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Privacy Principles */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Privacy Principles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <h4 className="font-semibold">Zero Server Storage</h4>
                  <p className="text-sm text-muted-foreground">
                    Your messages and data never touch our servers. Everything stays on your device.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <h4 className="font-semibold">Client-Side Encryption</h4>
                  <p className="text-sm text-muted-foreground">
                    All encryption happens on your device. We never have access to your keys.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <h4 className="font-semibold">Open Source Ready</h4>
                  <p className="text-sm text-muted-foreground">
                    Our code is transparent and auditable for complete trust.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                <div>
                  <h4 className="font-semibold">No Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    We don't track your usage, collect analytics, or build profiles.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                <div>
                  <h4 className="font-semibold">Local First</h4>
                  <p className="text-sm text-muted-foreground">
                    Everything works offline. Your data belongs to you, not the cloud.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                <div>
                  <h4 className="font-semibold">User Control</h4>
                  <p className="text-sm text-muted-foreground">
                    You decide what to store, share, and delete. Complete autonomy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tech Stack */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Built With Modern Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {techStack.map((tech, index) => (
              <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm mb-1">{tech.name}</div>
                <div className="text-xs text-muted-foreground">{tech.category}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">256-bit</div>
              <div className="text-sm text-muted-foreground">AES Encryption</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">0</div>
              <div className="text-sm text-muted-foreground">Data Collection</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-chart-3 mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Local Storage</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">∞</div>
              <div className="text-sm text-muted-foreground">Privacy</div>
            </div>
          </div>
        </Card>

        {/* Target Audience */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Designed For</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Students</h3>
              <p className="text-sm text-muted-foreground">
                Secure communication and data storage for academic and personal use
              </p>
            </div>
            <div className="text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Gen Z</h3>
              <p className="text-sm text-muted-foreground">
                Privacy-conscious digital natives who demand modern, secure tools
              </p>
            </div>
            <div className="text-center">
              <div className="bg-chart-3/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-chart-3" />
              </div>
              <h3 className="font-semibold mb-2">Privacy Advocates</h3>
              <p className="text-sm text-muted-foreground">
                Anyone who values digital privacy and wants control over their data
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
