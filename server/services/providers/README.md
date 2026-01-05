# Provider integration stubs

This folder contains placeholder modules for provider-specific analytics fetchers.

How to implement a real provider module:

- Use the provider's API (Twitter API v2, Facebook Graph API, Instagram Graph API, etc.).
- Use `account.accessToken` and refresh logic from `SocialAccount` to obtain valid tokens.
- Implement `export async function fetchAnalytics(account) { ... }` and return an array of items:
  - { postId: <ObjectId|string>, metrics: { likes, shares, comments, impressions, reach }, recordedAt: <ISO date> }
- Keep error handling and rate-limit/backoff logic.

Example:

```
import axios from 'axios'
export async function fetchAnalytics(account) {
  const token = account.accessToken
  const r = await axios.get('https://api.twitter.com/2/....', { headers: { Authorization: `Bearer ${token}` } })
  // transform and return array of metrics
}
```

Store any necessary client keys in `process.env` and document required scopes in README.
