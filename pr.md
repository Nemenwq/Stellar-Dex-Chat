## Summary

Resolves open issues across the frontend and Soroban smart contract: Zod schema improvements, overflow prevention, circuit breaker events, edge case validation, ARIA accessibility, and comprehensive hook test coverage.

## Changes
 

**#1176 — AdminGuard ARIA live-region announcements**
- Add `role="status"` and `aria-live="polite"` to loading state
- Add `role="alert"` and `aria-live="assertive"` to error messages
- Add descriptive `aria-label` attributes to spinner, error icon, and retry button
- Comprehensive accessibility tests verifying all ARIA attributes

**#1175 — useMediaQuery test coverage**
- Initial state tests: SSR fallback, matches/non-matches scenarios
- Update tests: media query state changes, query prop re-registration
- Cleanup tests: event listener removal on unmount and rerenders
- Branch coverage: multiple simultaneous queries, complex media query strings

**#1173 — useIdempotentAction test coverage**
- Initial state and async execution with resolve/reject paths
- Cooldown/throttling enforcement and expiry behavior
- In-flight action deduplication by `actionName`
- Reset functionality clearing state and cooldown timer
- Unmount cleanup preventing state updates after component unmount
- Error propagation and cleanup after action rejection

## Testing

All changes include comprehensive unit and integration tests:
- Frontend: `pnpm test:unit` passes with expanded coverage
- Contract: `cargo test` validates all new guard logic and error paths
- ARIA: Accessibility tests verify live-region announcements and semantic markup
- Hooks: Achieve ≥65% branch coverage per acceptance criteria

## Closes
  
Closes #1176  
Closes #1175  
Closes #1173
Closes #1172
