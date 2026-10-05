"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Chat } from "@/components/chat";
import { PhishingCheck } from "@/components/phishing-check";
import { Vault } from "@/components/vault";
import { About } from "@/components/about";
import { Footer } from "@/components/footer";
import { P2PTransfer } from "@/components/p2p-transfer";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <Hero />;
      case "chat":
        return <Chat />;
      case "phishing":
        return <PhishingCheck />;
      case "vault":
        return <Vault />;
      case "about":
        return <About />;
      case "p2p":
        return <P2PTransfer />;
      default:
        return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <main className="transition-all duration-300 ease-in-out">
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}
