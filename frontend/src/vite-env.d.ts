/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** REST base URL of the Express/MongoDB backend. Empty => mock data layer. */
  readonly VITE_API_BASE_URL?: string
  /** GitHub org / profile hosting the competition repositories. */
  readonly VITE_GITHUB_ORG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
