NETLIFY SINGLE-SELECT POLL SETUP

This version does 2 things:
1. All visitors see shared live tallies.
2. Each browser has only one active choice at a time.
   If someone clicks another option later, their vote moves instead of stacking.

Files in this folder:
- index.html
- netlify/functions/poll.mjs
- netlify.toml
- package.json

Important:
This is not true identity-based one-person-one-vote security.
It is browser-based single-selection behavior.
If someone uses another device/browser or clears storage, they can vote again.
