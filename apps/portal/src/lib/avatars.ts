export interface DeveloperAvatar {
  id: string;
  name: string;
  url: string;
}

export const DEVELOPER_AVATARS: DeveloperAvatar[] = [
  { id: "avatar-1",  name: "Cyber Neon Hacker",      url: "/avatars/avatar-1.svg" },
  { id: "avatar-2",  name: "Full-Stack Engineer",    url: "/avatars/avatar-2.svg" },
  { id: "avatar-3",  name: "DevOps Architect",       url: "/avatars/avatar-3.svg" },
  { id: "avatar-4",  name: "AI & ML Specialist",     url: "/avatars/avatar-4.svg" },
  { id: "avatar-5",  name: "Frontend UI Ninja",      url: "/avatars/avatar-5.svg" },
  { id: "avatar-6",  name: "Open-Source Maintainer", url: "/avatars/avatar-6.svg" },
  { id: "avatar-7",  name: "Cloud Architect",        url: "/avatars/avatar-7.svg" },
  { id: "avatar-8",  name: "Security Auditor",       url: "/avatars/avatar-8.svg" },
  { id: "avatar-9",  name: "Mobile App Craftsman",   url: "/avatars/avatar-9.svg" },
  { id: "avatar-10", name: "Principal Architect",    url: "/avatars/avatar-10.svg" },
];

/**
 * Deterministically returns one of the 10 developer avatars based on user ID or email string.
 */
export function getAutoAvatar(userIdOrEmail?: string): string {
  if (!userIdOrEmail) return DEVELOPER_AVATARS[0].url;
  let hash = 0;
  for (let i = 0; i < userIdOrEmail.length; i++) {
    hash = userIdOrEmail.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEVELOPER_AVATARS.length;
  return DEVELOPER_AVATARS[index].url;
}
