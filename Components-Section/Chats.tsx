"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wifi, WifiOff, Shield, Users, Send, Link2 } from "lucide-react";
import Peer, { DataConnection } from "peerjs";

interface Message {
  id: string;
  text: string;
  sender: "user" | "peer";
  timestamp: Date;
  encrypted: boolean;
  clientId?: string;
}

// PeerJS uses a separate signaling server. We optionally read config from env
// via NEXT_PUBLIC_PEER_* so local overrides can be provided if needed.

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userCount] = useState(0);
  const [clientId, setClientId] = useState<string>("");
  const [remoteId, setRemoteId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupPeer = useCallback(() => {
    try {
      // Optional env-based config for custom PeerServer
      const host = process.env.NEXT_PUBLIC_PEER_HOST;
      const port = process.env.NEXT_PUBLIC_PEER_PORT
        ? parseInt(process.env.NEXT_PUBLIC_PEER_PORT, 10)
        : undefined;
      const path = process.env.NEXT_PUBLIC_PEER_PATH;

      const peerOptions: ConstructorParameters<typeof Peer>[1] = {};
      if (host) {
        peerOptions.host = host;
      }
      if (port) {
        peerOptions.port = port;
        peerOptions.secure = typeof window !== "undefined" && window.location.protocol === "https:";
      }
      if (path) {
        peerOptions.path = path;
      }

      const peer = new Peer(undefined, peerOptions);
      peerRef.current = peer;

      peer.on("open", (id) => {
        setClientId(id);
        console.log("Peer open with id:", id);
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
      });

      peer.on("disconnected", () => {
        setIsConnected(false);
      });

      peer.on("connection", (conn) => {
        // Accept incoming connection
        attachConnection(conn);
      });
    } catch (e) {
      console.error("Failed to setup Peer:", e);
    }
  }, []);

  const attachConnection = (conn: DataConnection) => {
    connRef.current = conn;
    setIsConnected(false);

    conn.on("open", () => {
      setIsConnected(true);
      setRemoteId(conn.peer);
      // System message for connection established
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Connected to ${conn.peer}`,
          sender: "peer",
          timestamp: new Date(),
          encrypted: false,
        },
      ]);
    });

    conn.on("data", (data) => {
      if (typeof data === "string") {
        const message: Message = {
          id: Date.now().toString(),
          text: data,
          sender: "peer",
          timestamp: new Date(),
          encrypted: true,
        };
        setMessages((prev) => [...prev, message]);
      }
    });

    conn.on("close", () => {
      setIsConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Disconnected from ${conn.peer}`,
          sender: "peer",
          timestamp: new Date(),
          encrypted: false,
        },
      ]);
    });

    conn.on("error", (err) => {
      console.error("Connection error:", err);
      setIsConnected(false);
    });
  };

  useEffect(() => {
    setupPeer();
    return () => {
      try {
        connRef.current?.close();
        peerRef.current?.destroy();
      } catch {}
    };
  }, [setupPeer]);

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected || !connRef.current) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
      encrypted: true,
    };

    // Add to local messages immediately
    setMessages((prev) => [...prev, message]);

    // Send via PeerJS DataConnection
    try {
      connRef.current.send(newMessage);
    } catch (e) {
      console.error("Failed to send message:", e);
    }

    setNewMessage("");
  };

  const connectToRemote = () => {
    if (!peerRef.current || !remoteId.trim()) return;
    try {
      const conn = peerRef.current.connect(remoteId.trim(), { reliable: true });
      attachConnection(conn);
    } catch (e) {
      console.error("Failed to connect to remote:", e);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Peer-to-Peer Messaging</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Establish a direct P2P data channel using PeerJS. Share your ID with a peer and connect.
          </p>
        </div>

        {/* Connection Status */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="font-medium">
                {isConnected ? `Connected to ${remoteId || "peer"}` : clientId ? "Idle" : "Initializing..."}
              </span>
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <Link2 className="h-3 w-3" />
                <span>PeerJS</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Live Chat</span>
              </Badge>
            </div>
          </div>
          {/* Local/Remote IDs */}
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="text-xs text-muted-foreground">Your ID</label>
              <Input readOnly value={clientId || "..."} className="mt-1" />
            </div>
            <div className="sm:col-span-2 flex items-end space-x-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Remote ID</label>
                <Input
                  value={remoteId}
                  onChange={(e) => setRemoteId(e.target.value)}
                  placeholder="Enter peer ID"
                  className="mt-1"
                />
              </div>
              <Button onClick={connectToRemote} disabled={!clientId || !remoteId.trim()} className="mt-6">
                Connect
              </Button>
            </div>
          </div>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }
                  >
                    {message.sender === "user" ? "Y" : "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-xs lg:max-w-md ${
                    message.sender === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
                    <span>{formatTime(message.timestamp)}</span>
                    {message.encrypted && <Shield className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isConnected ? "Type your message..." : "Connect to a peer to chat"}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={!isConnected}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center space-x-1">
              <Wifi className="h-3 w-3" />
              <span>
                {isConnected ? `Connected via PeerJS to ${remoteId || "peer"}` : clientId ? "Share your ID or enter a remote ID to connect" : "Setting up Peer..."}
              </span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
