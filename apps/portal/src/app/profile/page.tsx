"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DeveloperProfile } from "../../types/portal";
import { User, CheckCircle2, RefreshCw } from "lucide-react";
import {
  ProfileHeaderBanner,
  ProfileMetricsStrip,
  ProfileNavTabs,
  ProfileAboutCard,
  ProfileVerificationCard,
  ProfileTechInterestsCard,
  ProfileConnectedAccountsCard,
  ProfileEliteCrownCard,
  ProfileQuickStatsCard,
  ProfileQuoteBanner,
  ProfileEditModal,
} from "../../components/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchProfile = () => {
    setLoading(true);
    fetch("/api/portal/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setProfile(d.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleProfileUpdated = (updated: DeveloperProfile) => {
    setProfile(updated);
  };

  return (
    <div className="page-container" style={{ maxWidth: "1400px", padding: "1.75rem 2rem 5rem" }}>
      {/* Loading State */}
      {loading && !profile && (
        <div className="loading-state">
          <div className="spinner" aria-label="Loading developer profile" />
          <p>Loading PostgreSQL Developer Identity &amp; Credentials...</p>
        </div>
      )}

      {/* Loaded Profile View matching Reference Image */}
      {!loading && profile && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.04,
              },
            },
          }}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {/* 1. Full-Width Hero Header Banner */}
          <motion.div variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } as any }
          }}>
            <ProfileHeaderBanner
              profile={profile}
              onOpenEditModal={() => setEditModalOpen(true)}
              onToast={triggerToast}
            />
          </motion.div>

          {/* 2. 4-Cell Metrics Strip */}
          <motion.div variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } as any }
          }}>
            <ProfileMetricsStrip profile={profile} />
          </motion.div>

          {/* 3. Sub-Navigation Tabs */}
          <motion.div variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } as any }
          }}>
            <ProfileNavTabs />
          </motion.div>

          {/* 4. Asymmetric 3-Column Main Grid */}
          <motion.div
            className="ref-main-grid"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } as any }
            }}
          >
            {/* Column 1 (Left): About Buyer & Verification */}
            <div>
              <ProfileAboutCard
                profile={profile}
                onOpenEditModal={() => setEditModalOpen(true)}
              />
              <ProfileVerificationCard profile={profile} />
            </div>

            {/* Column 2 (Middle): Tech Interests & Connected Accounts */}
            <div>
              <ProfileTechInterestsCard
                profile={profile}
                onOpenEditModal={() => setEditModalOpen(true)}
              />
              <ProfileConnectedAccountsCard
                profile={profile}
                onToast={triggerToast}
              />
            </div>

            {/* Column 3 (Right): Elite Crown Card, Quick Stats & Quote */}
            <div>
              <ProfileEliteCrownCard />
              <ProfileQuickStatsCard profile={profile} />
              <ProfileQuoteBanner />
            </div>
          </motion.div>

          {/* 5. Live Profile Edit Modal */}
          <ProfileEditModal
            profile={profile}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleProfileUpdated}
            onToast={triggerToast}
          />
        </motion.div>
      )}

      {/* Empty / Error State */}
      {!loading && !profile && (
        <div className="empty-state">
          <div className="empty-icon">
            <User size={24} aria-hidden="true" />
          </div>
          <h2 className="empty-title">Profile Data Not Found</h2>
          <p className="empty-desc">
            Could not fetch developer profile details from PostgreSQL database.
          </p>
          <button
            type="button"
            onClick={fetchProfile}
            className="btn btn-primary btn-md"
            style={{ marginTop: "1rem" }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Retry Sync</span>
          </button>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="portal-toast"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as any }}
          >
            <CheckCircle2 size={16} color="#10B981" aria-hidden="true" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
