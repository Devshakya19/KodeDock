"use client";

import React, { useState, useEffect } from "react";

interface PatToken {
  id: string;
  name: string;
  token_prefix: string;
  created_at: string;
  expires_at: string;
  scopes: string[];
}

export default function SettingsConnectPage() {
  const [tokens, setTokens] = useState<PatToken[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenExpiryDays, setTokenExpiryDays] = useState("30");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["repo:read", "deliverables:download"]);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [githubConnected, setGithubConnected] = useState(true);
  const [dockerConnected, setDockerConnected] = useState(false);

  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 5000);
  };

  useEffect(() => {
    const storedTokens = localStorage.getItem("kd_pat_tokens");
    if (storedTokens) {
      try {
        setTokens(JSON.parse(storedTokens));
      } catch {
        setTokens([]);
      }
    }
  }, []);

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) {
      showToast("Token name is required", "error");
      return;
    }

    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    const fullToken = `kd_live_${randomBytes}`;
    const prefix = `${fullToken.slice(0, 14)}...${fullToken.slice(-4)}`;

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + parseInt(tokenExpiryDays));

    const newToken: PatToken = {
      id: `pat_${Date.now()}`,
      name: tokenName.trim(),
      token_prefix: prefix,
      created_at: new Date().toISOString(),
      expires_at: expDate.toISOString(),
      scopes: selectedScopes,
    };

    const updated = [newToken, ...tokens];
    setTokens(updated);
    localStorage.setItem("kd_pat_tokens", JSON.stringify(updated));

    setNewlyCreatedToken(fullToken);
    setTokenName("");
    setIsCreating(false);
    showToast("Cryptographic PAT generated. Save it securely now!");
  };

  const handleRevokeToken = (id: string) => {
    const updated = tokens.filter(t => t.id !== id);
    setTokens(updated);
    localStorage.setItem("kd_pat_tokens", JSON.stringify(updated));
    showToast("Personal Access Token revoked and invalidated across git gateways.");
  };

  const handleCopyToken = () => {
    if (newlyCreatedToken) {
      navigator.clipboard.writeText(newlyCreatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      showToast("Token copied to clipboard!");
    }
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium border backdrop-blur-xl shadow-xl transition-all duration-300 animate-in slide-in-from-top-2 ${
            notice.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200 shadow-emerald-950/30"
              : "bg-rose-950/60 border-rose-500/40 text-rose-200 shadow-rose-950/30"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">{notice.type === "success" ? "⚡" : "⚠️"}</span>
            <span>{notice.text}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* NEW TOKEN REVEAL MODAL / BANNER */}
      {newlyCreatedToken && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#1C1A14]/90 to-[#121217] border border-amber-500/40 backdrop-blur-xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-300 font-mono text-xs tracking-wider uppercase font-bold">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>NEW PERSONAL ACCESS TOKEN GENERATED</span>
            </div>
            <button
              onClick={() => setNewlyCreatedToken(null)}
              className="text-xs font-mono text-[#A1A1AA] hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              DONE / DISMISS
            </button>
          </div>

          <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
            ⚠️ <strong>CRITICAL:</strong> Make sure to copy your Personal Access Token now. You will not be able to see it again!
          </p>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0C0C10] border border-amber-500/30">
            <code className="text-xs sm:text-sm font-mono text-emerald-400 select-all truncate flex-1 tracking-wider">
              {newlyCreatedToken}
            </code>
            <button
              onClick={handleCopyToken}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
            >
              {copied ? "COPIED! ✓" : "COPY TOKEN"}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: GIT CLI & TERMINAL WORKFLOW */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">TERMINAL // GIT_CLI_AUTH</div>
            <h3 className="text-lg font-heading font-bold text-white tracking-tight">Personal Access Tokens (PAT)</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-violet-600/30 border border-violet-400/40 cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <span>+</span>
            <span>GENERATE NEW TOKEN</span>
          </button>
        </div>

        {/* CLI Usage Code Preview */}
        <div className="p-4 rounded-2xl bg-[#0D0D12] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A]">
            <span>TERMINAL COMMAND</span>
            <span className="text-emerald-400">GIT-HTTP-GATEWAY</span>
          </div>
          <div className="font-mono text-xs text-white/90 space-y-1 overflow-x-auto py-1">
            <p className="text-violet-300">$ git clone https://kodedock.com/repo/orders/kd_live_escrow.git</p>
            <p className="text-[#71717A]">Username: <span className="text-white">your_email@kodedock.internal</span></p>
            <p className="text-[#71717A]">Password: <span className="text-emerald-400">&lt;YOUR_PERSONAL_ACCESS_TOKEN&gt;</span></p>
          </div>
        </div>

        {/* TOKEN GENERATOR DRAWER */}
        {isCreating && (
          <form onSubmit={handleCreateToken} className="p-6 rounded-2xl bg-[#121217]/90 border border-violet-500/30 space-y-5 animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">Create Personal Access Token</span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-[#71717A] hover:text-white"
              >
                ✕ CANCEL
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#A1A1AA]">[FIELD: TOKEN_NAME]</label>
                <input
                  type="text"
                  required
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g. MacBook Pro M3 CLI"
                  className="w-full px-4 py-3 rounded-xl bg-[#17171E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#A1A1AA]">[FIELD: EXPIRATION_WINDOW]</label>
                <select
                  value={tokenExpiryDays}
                  onChange={(e) => setTokenExpiryDays(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#17171E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
                >
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                  <option value="180">180 Days</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA]">SELECT SECURITY SCOPES</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "repo:read", desc: "Read access to purchased repositories & inspect branches" },
                  { id: "deliverables:download", desc: "Permission to download decrypted production archives" },
                  { id: "disputes:write", desc: "Reply and upload logs to escrow arbitration cases" },
                  { id: "releases:push", desc: "Upload vendor release patches via Git remote" },
                ].map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => toggleScope(scope.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedScopes.includes(scope.id)
                        ? "bg-violet-950/40 border-violet-500/50 text-white"
                        : "bg-[#17171E]/50 border-white/5 text-[#71717A] hover:text-white hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span>{scope.id}</span>
                      <span className={selectedScopes.includes(scope.id) ? "text-violet-400" : "text-[#52525B]"}>
                        {selectedScopes.includes(scope.id) ? "✓" : "+"}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#A1A1AA] mt-0.5">{scope.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                GENERATE TOKEN
              </button>
            </div>
          </form>
        )}

        {/* ACTIVE TOKENS LIST */}
        <div className="space-y-3">
          {tokens.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#121217]/60 border border-white/5 text-center space-y-2">
              <div className="text-xs font-mono text-white">No Personal Access Tokens Created</div>
              <p className="text-[11px] text-[#71717A]">
                Generate a token above to authenticate via standard Git CLI commands (`git clone`, `git pull`).
              </p>
            </div>
          ) : (
            tokens.map((token) => (
              <div
                key={token.id}
                className="p-4 rounded-2xl bg-[#121217]/80 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-white font-mono">{token.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-xs font-mono text-violet-300 mt-1">{token.token_prefix}</div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {token.scopes.map(s => (
                      <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#A1A1AA] border border-white/5">
                        {s}
                      </span>
                    ))}
                    <span className="text-[10px] font-mono text-[#71717A] ml-2">
                      Expires: {new Date(token.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRevokeToken(token.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono transition-all cursor-pointer shrink-0 self-end sm:self-center"
                >
                  REVOKE
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: LINKED CLOUD INTEGRATIONS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
        <div className="border-b border-white/5 pb-4">
          <div className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">INTEGRATIONS // CLOUD_PROVIDERS</div>
          <h3 className="text-lg font-heading font-bold text-white tracking-tight">Connected Developer Platforms</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub Integration */}
          <div className="p-5 rounded-2xl bg-[#121217]/80 border border-white/5 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🐙</span>
                <span className="text-xs font-bold text-white font-mono">GitHub Enterprise</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono">
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Synchronized for GPG commit verification and automated branch sync.
              </p>
            </div>
            <button
              onClick={() => {
                setGithubConnected(!githubConnected);
                showToast(githubConnected ? "GitHub disconnected" : "GitHub connected");
              }}
              className="text-xs font-mono text-[#71717A] hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer shrink-0"
            >
              {githubConnected ? "DISCONNECT" : "CONNECT"}
            </button>
          </div>

          {/* Docker Registry Integration */}
          <div className="p-5 rounded-2xl bg-[#121217]/80 border border-white/5 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🐳</span>
                <span className="text-xs font-bold text-white font-mono">Docker OCI Registry</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[#71717A] border border-white/5 text-[9px] font-mono">
                  DISCONNECTED
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Automated OCI container image inspection and Trivy vulnerability auditing.
              </p>
            </div>
            <button
              onClick={() => {
                setDockerConnected(!dockerConnected);
                showToast(dockerConnected ? "Docker disconnected" : "Docker connected");
              }}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 cursor-pointer shrink-0"
            >
              {dockerConnected ? "DISCONNECT" : "CONNECT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
