"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Search, Lock, ArrowRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              <span>Built for Gen Z Security</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white bg-clip-text text-transparent">
                SecureLink Vault
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              The ultimate security suite for students and Gen Z. Encrypted
              messaging, phishing protection, and secure data storage - all in
              one modern, privacy-first platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-6 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three Powerful Tools, One Secure Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay secure online, designed with privacy
              and usability in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-all duration-300 group border-2 hover:border-primary/20">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Encrypted Messaging</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                End-to-end encrypted peer-to-peer messaging with no server
                storage. Your conversations stay completely private with AES-256
                encryption.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Real-time messaging</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Typing indicators</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>No server storage</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300 group border-2 hover:border-accent/20">
              <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Phishing Detection</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Advanced AI-powered phishing detection to keep you safe from
                malicious links. Get instant safety reports with detailed
                explanations.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>ML-powered detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Instant safety reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Domain reputation checks</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300 group border-2 hover:border-chart-3/20">
              <div className="bg-chart-3/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="h-8 w-8 text-chart-3" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure Vault</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Store passwords, notes, and sensitive data locally with AES-256
                encryption. Your data never leaves your device.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-chart-3 rounded-full" />
                  <span>Local storage only</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-chart-3 rounded-full" />
                  <span>Master password protection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-chart-3 rounded-full" />
                  <span>Search & organize</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">256-bit</div>
              <div className="text-muted-foreground">AES Encryption</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent">Zero</div>
              <div className="text-muted-foreground">Server Storage</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-chart-3">100%</div>
              <div className="text-muted-foreground">Privacy Focused</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
