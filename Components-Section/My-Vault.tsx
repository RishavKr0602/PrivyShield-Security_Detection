"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lock,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Key,
  FileText,
  CreditCard,
  Shield,
} from "lucide-react";

interface VaultEntry {
  id: string;
  type: "password" | "note" | "card";
  title: string;
  username?: string;
  password?: string;
  url?: string;
  note?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function Vault() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);
  const [newType, setNewType] = useState<"password" | "note" | "card">(
    "password"
  );
  const [newTitle, setNewTitle] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [newCvv, setNewCvv] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null);
  const [saltB64, setSaltB64] = useState<string | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
  const [filesList, setFilesList] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    createdAt: number;
  }>>([]);
  const filePickerRef = useState<HTMLInputElement | null>(null)[0];

  // Storage helpers
  const VAULT_STORAGE_KEY = "secure_vault_entries";
  const VAULT_SALT_KEY = "secure_vault_salt";

  const arrayBufferToBase64 = (buf: ArrayBuffer) => {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const base64ToArrayBuffer = (b64: string) => {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const getOrCreateSalt = () => {
    let salt = localStorage.getItem(VAULT_SALT_KEY);
    if (!salt) {
      const random = crypto.getRandomValues(new Uint8Array(16));
      salt = arrayBufferToBase64(random.buffer);
      localStorage.setItem(VAULT_SALT_KEY, salt);
    }
    setSaltB64(salt);
    return salt;
  };

  const deriveKey = async (password: string, saltB64Local?: string) => {
    const salt = base64ToArrayBuffer(saltB64Local || getOrCreateSalt());
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 250000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    return key;
  };

  const encryptEntries = async (key: CryptoKey, items: VaultEntry[]) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const payload = JSON.stringify(
      items.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }))
    );
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(payload)
    );
    const bundle = {
      iv: arrayBufferToBase64(iv.buffer),
      data: arrayBufferToBase64(ciphertext),
    };
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(bundle));
  };

  const decryptEntries = async (key: CryptoKey): Promise<VaultEntry[]> => {
    const bundleRaw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!bundleRaw) return [];
    const bundle = JSON.parse(bundleRaw) as { iv: string; data: string };
    const iv = new Uint8Array(base64ToArrayBuffer(bundle.iv));
    const data = base64ToArrayBuffer(bundle.data);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    const dec = new TextDecoder();
    const json = JSON.parse(dec.decode(decrypted)) as any[];
    return json.map((e) => ({
      ...e,
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
    }));
  };

  // IndexedDB helpers for encrypted files
  const DB_NAME = "secure_vault_db";
  const DB_VERSION = 1;
  const STORE_FILES = "files";

  const openDb = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          const store = db.createObjectStore(STORE_FILES, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };

  const listEncryptedFiles = async (): Promise<typeof filesList> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, "readonly");
      const store = tx.objectStore(STORE_FILES);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = (req.result || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          size: r.size,
          type: r.type,
          createdAt: r.createdAt,
        }));
        resolve(items.sort((a, b) => b.createdAt - a.createdAt));
      };
      req.onerror = () => reject(req.error);
    });
  };

  const putEncryptedFile = async (record: any) => {
    const db = await openDb();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE_FILES).put(record);
    });
  };

  const getEncryptedFile = async (id: string): Promise<any | null> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, "readonly");
      const req = tx.objectStore(STORE_FILES).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  };

  const deleteEncryptedFile = async (id: string) => {
    const db = await openDb();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE_FILES).delete(id);
    });
  };

  const refreshFilesList = async () => {
    const items = await listEncryptedFiles();
    setFilesList(items);
  };

  // Unlock using supplied master password
  const unlock = async () => {
    try {
      setIsBusy(true);
      setCryptoError(null);
      const salt = getOrCreateSalt();
      const key = await deriveKey(masterPassword, salt);
      setDerivedKey(key);
      const loaded = await decryptEntries(key);
      setEntries(loaded);
      setIsUnlocked(true);
      setMasterPassword("");
      await refreshFilesList();
    } catch (e) {
      console.error(e);
      setCryptoError("Failed to unlock. Check password.");
    } finally {
      setIsBusy(false);
    }
  };

  const lock = () => {
    setIsUnlocked(false);
    setEntries([]);
    setShowPasswords({});
    setDerivedKey(null);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.url?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || entry.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Save new entry
  const onSaveNewEntry = async () => {
    if (!derivedKey) return;
    const now = new Date();
    const entry: VaultEntry = {
      id: Math.random().toString(36).slice(2),
      type: newType,
      title: newTitle || "Untitled",
      username: newUsername || undefined,
      password: newType === "password" ? newPassword || undefined : undefined,
      url: newUrl || undefined,
      note: newType === "note" ? newNote || undefined : undefined,
      cardNumber: newType === "card" ? newCardNumber || undefined : undefined,
      expiryDate: newType === "card" ? newExpiryDate || undefined : undefined,
      cvv: newType === "card" ? newCvv || undefined : undefined,
      createdAt: now,
      updatedAt: now,
    };
    const next = [...entries, entry];
    setEntries(next);
    await encryptEntries(derivedKey, next);
    // reset form
    setNewTitle("");
    setNewUsername("");
    setNewPassword("");
    setNewUrl("");
    setNewNote("");
    setNewCardNumber("");
    setNewExpiryDate("");
    setNewCvv("");
    setIsAddDialogOpen(false);
  };

  const onDeleteEntry = async (id: string) => {
    if (!derivedKey) return;
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    await encryptEntries(derivedKey, next);
  };

  // Encrypt and store a file in IndexedDB
  const onUploadFiles = async (files: FileList | null) => {
    if (!files || !derivedKey) return;
    setFileBusy(true);
    try {
      for (const file of Array.from(files)) {
        const buf = await file.arrayBuffer();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const cipher = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          derivedKey,
          buf
        );
        const record = {
          id: Math.random().toString(36).slice(2),
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          iv: arrayBufferToBase64(iv.buffer),
          data: cipher, // ArrayBuffer stored directly in IDB
          createdAt: Date.now(),
        };
        await putEncryptedFile(record);
      }
      await refreshFilesList();
    } finally {
      setFileBusy(false);
    }
  };

  // Decrypt and download a file
  const onDownloadFile = async (id: string) => {
    if (!derivedKey) return;
    const rec = await getEncryptedFile(id);
    if (!rec) return;
    const iv = new Uint8Array(base64ToArrayBuffer(rec.iv));
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      derivedKey,
      rec.data
    );
    const blob = new Blob([plain], { type: rec.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = rec.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onDeleteFile = async (id: string) => {
    await deleteEncryptedFile(id);
    await refreshFilesList();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "password":
        return <Key className="h-4 w-4" />;
      case "note":
        return <FileText className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "password":
        return "bg-primary/10 text-primary";
      case "note":
        return "bg-accent/10 text-accent";
      case "card":
        return "bg-chart-3/10 text-chart-3";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Secure Vault</h1>
            <p className="text-muted-foreground">
              Enter your master password to unlock your encrypted vault
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="master-password" className="mb-4">
                Master Password
              </Label>
              <Input
                id="master-password"
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Enter master password"
                onKeyPress={(e) => e.key === "Enter" && unlock()}
              />
            </div>
            <Button onClick={unlock} className="w-full" disabled={!masterPassword || isBusy}>
              {isBusy ? "Unlocking..." : "Unlock Vault"}
            </Button>
            {cryptoError && (
              <p className="text-xs text-red-500 text-center">{cryptoError}</p>
            )}
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Security Features</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• AES-256 encryption</li>
              <li>• Local storage only</li>
              <li>• Zero server access</li>
              <li>• Master password protection</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Secure Vault</h1>
            <p className="text-muted-foreground">
              {entries.length} encrypted entries stored locally
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select defaultValue="password" onValueChange={(v) => setNewType(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="password">Password</SelectItem>
                        <SelectItem value="note">Secure Note</SelectItem>
                        <SelectItem value="card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input placeholder="Entry title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  </div>
                  {newType !== "note" && (
                    <div>
                      <Label>Username</Label>
                      <Input placeholder="Username or email" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                    </div>
                  )}
                  {newType === "password" && (
                    <div>
                      <Label>Password</Label>
                      <Input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                  )}
                  {newType !== "card" && (
                    <div>
                      <Label>URL</Label>
                      <Input placeholder="https://example.com" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                    </div>
                  )}
                  {newType === "note" && (
                    <div>
                      <Label>Secure Note</Label>
                      <Input placeholder="Write your note" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                    </div>
                  )}
                  {newType === "card" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label>Card Number</Label>
                        <Input placeholder="1234 5678 9012 3456" value={newCardNumber} onChange={(e) => setNewCardNumber(e.target.value)} />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input placeholder="123" value={newCvv} onChange={(e) => setNewCvv(e.target.value)} />
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button onClick={onSaveNewEntry} disabled={!derivedKey || !newTitle}>Save Entry</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={lock}>
              <Lock className="h-4 w-4 mr-2" />
              Lock Vault
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search entries..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="password">Passwords</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
                <SelectItem value="card">Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Entries Grid */}
        <div className="grid gap-4">
          {/* Encrypted Files Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Encrypted Files</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="vault-file-input"
                  onChange={(e) => onUploadFiles(e.target.files)}
                />
                <Button
                  onClick={() => document.getElementById("vault-file-input")?.click()}
                  disabled={!derivedKey || fileBusy}
                >
                  {fileBusy ? "Encrypting..." : "Upload"}
                </Button>
              </div>
            </div>

            {filesList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No encrypted files yet.</p>
            ) : (
              <div className="space-y-3">
                {filesList.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(f.size / 1024 / 1024).toFixed(2)} MB • {new Date(f.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onDownloadFile(f.id)}>Download</Button>
                      <Button size="sm" variant="ghost" onClick={() => onDeleteFile(f.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(
                      entry.type
                    )}`}
                  >
                    {getTypeIcon(entry.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold truncate">{entry.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {entry.type}
                      </Badge>
                    </div>

                    {entry.type === "password" && (
                      <div className="space-y-2 text-sm">
                        {entry.username && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">
                              Username:
                            </span>
                            <span className="font-mono">{entry.username}</span>
                          </div>
                        )}
                        {entry.password && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">
                              Password:
                            </span>
                            <span className="font-mono">
                              {showPasswords[entry.id]
                                ? entry.password
                                : "••••••••"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(entry.id)}
                            >
                              {showPasswords[entry.id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                        {entry.url && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">
                              URL:
                            </span>
                            <span className="font-mono text-primary truncate">
                              {entry.url}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {entry.type === "note" && entry.note && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Note:</span>
                        <p className="mt-1 whitespace-pre-wrap text-sm bg-muted/50 p-2 rounded">
                          {entry.note}
                        </p>
                      </div>
                    )}

                    {entry.type === "card" && (
                      <div className="space-y-2 text-sm">
                        {entry.cardNumber && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">
                              Number:
                            </span>
                            <span className="font-mono">
                              {showPasswords[entry.id]
                                ? entry.cardNumber
                                : "•••• •••• •••• " +
                                  entry.cardNumber.slice(-4)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(entry.id)}
                            >
                              {showPasswords[entry.id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                        {entry.expiryDate && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">
                              Expires:
                            </span>
                            <span className="font-mono">
                              {entry.expiryDate}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-3">
                      Updated {entry.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDeleteEntry(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <Card className="p-12 text-center">
            <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No entries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Add your first entry to get started"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
