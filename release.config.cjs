/**
 * semantic-release — run via CI (workflow_dispatch) or locally with repo permissions.
 * @see docs/en/adr/ADR-0006-release-and-tauri-ci-workflows.md
 */
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github',
  ],
}
