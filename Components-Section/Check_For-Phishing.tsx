"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock,
  Brain,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface PhishingResult {
  url: string;
  isSafe: boolean;
  score: number;
  reasons: string[];
  domain: string;
  hasHttps: boolean;
  timestamp: Date;
  aiAnalysis?: string;
  threatTypes?: string[];
}

export function PhishingCheck() {
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PhishingResult | null>(null);
  const [history, setHistory] = useState<PhishingResult[]>([]);

  const GEMINI_API_KEY = "AIzaSyBbOeyqO7NqTdZsd-LWzz4RLLFYm_m_Z5s"; // Replace with your actual API key
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const analyzeUrlWithGemini = async (
    urlToCheck: string
  ): Promise<{
    isSafe: boolean;
    score: number;
    reasons: string[];
    analysis: string;
    threatTypes: string[];
  }> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Analyze this URL for phishing and security threats: ${urlToCheck}
        
        Please provide a comprehensive security analysis including:
        1. Overall safety assessment (safe/unsafe)
        2. Security score (0-100, where 100 is completely safe)
        3. Specific reasons for the assessment
        4. Types of threats detected (if any)
        5. Detailed analysis explanation
        
        Consider these factors:
        - Domain reputation and legitimacy
        - URL structure and patterns
        - Known phishing indicators
        - Suspicious keywords or typosquatting
        - SSL/HTTPS usage
        - URL shorteners or redirects
        - Homograph attacks
        - Social engineering indicators
        
        Respond in this exact JSON format:
        {
          "isSafe": boolean,
          "score": number (0-100),
          "reasons": ["reason1", "reason2", ...],
          "analysis": "detailed explanation",
          "threatTypes": ["threat1", "threat2", ...] (empty array if safe)
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return analysis;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fallback to basic analysis if API fails
      return fallbackAnalysis(urlToCheck);
    }
  };

  const fallbackAnalysis = (urlToCheck: string) => {
    const domain = extractDomain(urlToCheck);
    const hasHttps = urlToCheck.startsWith("https://");
    const suspiciousPatterns = [
      "bit.ly",
      "tinyurl",
      "goo.gl",
      "t.co",
      "paypal-security",
      "amazon-update",
      "microsoft-login",
      "google-verify",
      "apple-id-locked",
    ];

    const isSuspicious = suspiciousPatterns.some(
      (pattern) =>
        domain.toLowerCase().includes(pattern) ||
        urlToCheck.toLowerCase().includes(pattern)
    );

    const reasons = [];
    let score = 85;

    if (!hasHttps) {
      reasons.push("No HTTPS encryption detected");
      score -= 30;
    }

    if (isSuspicious) {
      reasons.push("Domain contains suspicious keywords");
      score -= 40;
    }

    if (domain.includes("-") && domain.split("-").length > 3) {
      reasons.push("Unusual domain structure with multiple hyphens");
      score -= 20;
    }

    if (urlToCheck.length > 100) {
      reasons.push("Unusually long URL");
      score -= 15;
    }

    if (score > 70) {
      reasons.push("Domain appears legitimate");
      if (hasHttps) reasons.push("Secure HTTPS connection");
    }

    return {
      isSafe: score > 50,
      score: Math.max(0, Math.min(100, score)),
      reasons,
      analysis: "Basic pattern analysis (API unavailable)",
      threatTypes: isSuspicious ? ["Suspicious Domain"] : [],
    };
  };

  const checkUrl = async () => {
    if (!url.trim()) return;

    setIsChecking(true);

    try {
      const analysis = await analyzeUrlWithGemini(url);
      const domain = extractDomain(url);
      const hasHttps = url.startsWith("https://");

      const newResult: PhishingResult = {
        url,
        isSafe: analysis.isSafe,
        score: analysis.score,
        reasons: analysis.reasons,
        domain,
        hasHttps,
        timestamp: new Date(),
        aiAnalysis: analysis.analysis,
        threatTypes: analysis.threatTypes,
      };

      setResult(newResult);
      setHistory((prev) => [newResult, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error("Error checking URL:", error);
      // Show error state or fallback
    } finally {
      setIsChecking(false);
    }
  };

  const extractDomain = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return url.split("/")[0];
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            AI-Powered Phishing Detection
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Protect yourself from malicious links with our Gemini AI-powered
            phishing detection. Get instant safety reports and detailed threat
            analysis.
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Brain className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-blue-600 font-medium">
              Powered by Gemini AI
            </span>
          </div>
        </div>

        {/* URL Input */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a URL to check for phishing (e.g., https://example.com)"
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && checkUrl()}
              />
              <Button
                onClick={checkUrl}
                disabled={!url.trim() || isChecking}
                className="px-6"
              >
                {isChecking ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>AI Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>AI Check URL</span>
                  </div>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl("https://github.com")}
              >
                Try: github.com
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setUrl("http://paypal-security-update.suspicious-domain.com")
                }
              >
                Try: Suspicious URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl("https://g00gle.com")}
              >
                Try: Typosquatting
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <Card className="p-6 mb-8">
            <div className="space-y-6">
              {/* Safety Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {result.isSafe ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold">
                      {result.isSafe ? "Safe Link" : "Potentially Dangerous"}
                    </h3>
                    <p className="text-muted-foreground">
                      AI Safety Score: {result.score}/100
                    </p>
                  </div>
                </div>
                <Badge
                  variant={result.isSafe ? "default" : "destructive"}
                  className="text-sm px-3 py-1"
                >
                  {result.isSafe ? "SAFE" : "DANGER"}
                </Badge>
              </div>

              {result.threatTypes && result.threatTypes.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Detected Threats:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.threatTypes.map((threat, index) => (
                      <Badge
                        key={index}
                        variant="destructive"
                        className="text-xs"
                      >
                        {threat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>URL Analysis</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domain:</span>
                      <span className="font-mono">{result.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HTTPS:</span>
                      <div className="flex items-center space-x-1">
                        {result.hasHttps ? (
                          <>
                            <Lock className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">Secure</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-red-500">Not Secure</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Checked:</span>
                      <span>{result.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>AI Analysis Results</span>
                  </h4>
                  <div className="space-y-2">
                    {result.reasons.map((reason, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 text-sm"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-2 ${
                            result.isSafe ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {result.aiAnalysis && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>AI Detailed Analysis</span>
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {result.aiAnalysis}
                  </p>
                </div>
              )}

              {/* Full URL */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Full URL:</p>
                <p className="font-mono text-sm break-all">{result.url}</p>
              </div>
            </div>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent AI Checks</h3>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {item.isSafe ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="font-mono text-sm">{item.domain}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.timestamp.toLocaleString()}
                      </p>
                      {item.threatTypes && item.threatTypes.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {item.threatTypes.slice(0, 2).map((threat, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              {threat}
                            </Badge>
                          ))}
                          {item.threatTypes.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{item.threatTypes.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{item.score}/100</span>
                    <Badge
                      variant={item.isSafe ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {item.isSafe ? "SAFE" : "DANGER"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
