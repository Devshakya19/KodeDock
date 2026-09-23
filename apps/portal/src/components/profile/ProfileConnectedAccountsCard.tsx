"use client";

import React, { useState } from "react";
import type { DeveloperProfile } from "../../types/portal";
import { Link2, ChevronRight, Check } from "lucide-react";

interface ProfileConnectedAccountsCardProps {
  profile: DeveloperProfile;
  onToast: (msg: string) => void;
}

export const ProfileConnectedAccountsCard: React.FC<ProfileConnectedAccountsCardProps> = ({
  profile,
  onToast,
}) => {
  const [ghConnected, setGhConnected] = useState(true);
  const [twConnected, setTwConnected] = useState(false);
  const [liConnected, setLiConnected] = useState(false);

  const toggleConnect = (provider: string, currentState: boolean, setter: (val: boolean) => void) => {
    setter(!currentState);
    onToast(!currentState ? `${provider} account linked` : `${provider} account unlinked`);
  };

  return (
    <div className="ref-card">
      <div className="ref-card-header">
        <div>
          <div className="ref-card-header-title">
            <div className="ref-card-header-icon">
              <Link2 size={16} color="#8B5CF6" aria-hidden="true" />
            </div>
            <span>Connected Accounts</span>
          </div>
          <div className="ref-card-subdesc">
            Your linked accounts and profiles.
          </div>
        </div>
      </div>

      <div className="ref-card-body ref-connected-body">
        {/* Row 1: GitHub */}
        <div className="ref-account-row">
          <div className="ref-account-left">
            <div className="ref-account-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </div>
            <div>
              <div className="ref-account-name">GitHub</div>
              <div className="ref-account-handle font-mono">@{profile.githubHandle || "priya-dev"}</div>
            </div>
          </div>

          <div className="ref-account-right">
            <button
              type="button"
              className={ghConnected ? "ref-btn-connected" : "ref-btn-connect"}
              onClick={() => toggleConnect("GitHub", ghConnected, setGhConnected)}
            >
              {ghConnected ? <Check size={12} aria-hidden="true" /> : null}
              <span>{ghConnected ? "Connected" : "Connect"}</span>
            </button>
            <ChevronRight size={15} color="var(--text-muted)" aria-hidden="true" />
          </div>
        </div>

        {/* Row 2: Twitter / X */}
        <div className="ref-account-row">
          <div className="ref-account-left">
            <div className="ref-account-icon-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div>
              <div className="ref-account-name">Twitter / X</div>
              <div className="ref-account-handle font-mono">@{profile.twitterHandle || "priya_dev"}</div>
            </div>
          </div>

          <div className="ref-account-right">
            <button
              type="button"
              className={twConnected ? "ref-btn-connected" : "ref-btn-connect"}
              onClick={() => toggleConnect("Twitter / X", twConnected, setTwConnected)}
            >
              {twConnected ? <Check size={12} aria-hidden="true" /> : null}
              <span>{twConnected ? "Connected" : "Connect"}</span>
            </button>
            <ChevronRight size={15} color="var(--text-muted)" aria-hidden="true" />
          </div>
        </div>

        {/* Row 3: LinkedIn */}
        <div className="ref-account-row">
          <div className="ref-account-left">
            <div className="ref-account-icon-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </div>
            <div>
              <div className="ref-account-name">LinkedIn</div>
              <div className="ref-account-handle font-mono">@{profile.linkedinHandle || "priya-dev"}</div>
            </div>
          </div>

          <div className="ref-account-right">
            <button
              type="button"
              className={liConnected ? "ref-btn-connected" : "ref-btn-connect"}
              onClick={() => toggleConnect("LinkedIn", liConnected, setLiConnected)}
            >
              {liConnected ? <Check size={12} aria-hidden="true" /> : null}
              <span>{liConnected ? "Connected" : "Connect"}</span>
            </button>
            <ChevronRight size={15} color="var(--text-muted)" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
};
