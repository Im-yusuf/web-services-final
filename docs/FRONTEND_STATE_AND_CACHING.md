# Frontend State, Persistence, and Caching

## State management approach

Pinia is used for application-level state.

Main stores:

- auth store: user/token/session state
- saved store: saved listings data and operations
- comparison store: selected properties for side-by-side compare
- filters store: shared filter criteria
- data cache store: memoized expensive dashboard datasets

## Authentication persistence

Auth store writes:

- `econest_token`
- `econest_user`

to browser local storage after login/register.

On app load, values are restored to keep user signed in until logout/token expiry.

## API request behavior

Axios interceptors:

- request interceptor attaches Bearer token when present
- response interceptor clears local auth on 401 and redirects to login

This keeps auth flow consistent across all pages.

## Data cache store design

Store: `frontend/src/stores/dataCache.ts`

Cached datasets:

- stats
- default trends (unfiltered)
- heatmap
- regions list

TTL:

- 5 minutes

Behavior:

- if cache entry is fresh, serve from memory
- if expired/missing, call API and refresh cache entry

## Why caching was added

Without caching, navigating between dashboard/trends/heatmap repeatedly caused repeated expensive API calls and visible loading delays.

With caching:

- fewer duplicate network requests
- faster perceived navigation
- lower backend query pressure

## Saved notes state

Saved listings store supports:

- fetch all saved
- save listing
- remove listing
- update notes (including clearing note by sending null)

Saved view supports inline note edit and delete UX.

## Comparison state

Comparison store maintains up to 3 selected properties in memory.

- select/deselect via toggle
- selection shown from properties and saved pages
- comparison page renders side-by-side attribute table and insight cards

No additional backend endpoint is needed for comparison.

## Practical debugging tips

If auth appears stale:

- clear local storage keys
- re-login to issue a new token

If charts seem outdated:

- wait for TTL expiry or trigger cache invalidation
