pub mod github;
pub mod google;

/// A standardized user profile returned by ANY OAuth provider (GitHub, Google, Discord, etc.)
#[derive(Debug)]
pub struct OAuthUserProfile {
    pub provider_id: String,
    pub email: Option<String>,
    pub name: String,
    pub avatar_url: Option<String>,
}
