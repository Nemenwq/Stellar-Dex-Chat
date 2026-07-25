# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


### Added

- **chat:** Add error boundary fallback
- **payout:** Add provider interface and registry
- **chat:** Mobile bottom-sheet pattern for chat history
- Added preset amount
- Add CI workflow for contract tests
- Standard linting
- Add rate limiting to route
- Implement time-locked withdrawals for FiatBridge (closes #99)
- Build bank details and fiat payout UI
- **settings:** Fiat currency preference and defaults
- Add on-chain deposit receipt system to FiatBridge contract
- **contract:** Add per-address deposit cooldown
- Add depositor allowlist with admin-controlled access
- Add multi-token support to FiatBridge contract
- Add configurable protocol fee collection to FiatBridge contract #101
- Add rolling 24-hour withdrawal limit to FiatBridge contract #105
- Add rolling 24-hour withdrawal limit to FiatBridge contract
- Add batch withdrawal processing to FiatBridge contract
- Contextual help cards for first time users
- Add multi-account wallet selector with dropdown in header
- Add wallet session TTL with 24-hour expiry and secure reconnect
- Add transaction fee estimate before submit
- Add saved beneficiary templates with select, rename, delete controls
- Implement Wave features #56, #76, #71, #78
- Add schema version key, migration logic, and tests (issue #107)
- Implement Notifications Center for Tx and Payout Events
- Offline-banner + retry queue; chore: lockfile; docs: PR template
- **bridge:** Implement TTL caching for contract read operations
- **frontend:** Improve transaction safety and theming
- Implement issues #10 #11 #15 #38
- Implement admin security enhancements
- Admin reconciliation dashboard
- Expand landing page hero section with bridge explanation
- Wave feature: downloadable reciept for successful operations
- Add emergency_drain admin function for atomic contract balance recovery with robust tests
- Implement deposit_for for third-party payer, tests passing per issue requirements
- **chat:** Implement slash commands and local FAQ retrieval
- Show wallet network mismatch warning and disable write actions
- **chat:** Display live bridge stats in header with 30s polling
- Add deterministic parser before AI extraction for amount, token, and fiat
- **fiat-payout:** Lock quote for 120s with countdown and fix XLM price lookup
- Integrate oracle for USD-equivalent deposit limits
- Implement centralized env schema validation
- Implement daily volume chart in admin dashboard
- Implement typed feature flag registry
- **contract:** Implement overflow prevention for is_denied
- **frontend:** Add optimistic UI updates to StellarFiatModal.tsx
- Add replay-safe webhooks and pre-sign tx summary
- Add keyboard command palette, request cancellation, wallet timeline, and modal accessibility
- Add health endpoint and status badge
- Add health endpoint and status badge
- Implement virtualized chat messages for improved performance
- Add profanity and sensitive term masking for chat UI
- Add message retry UX for failed assistant responses
- Add finite-state machine for chat lifecycle
- **smart-contract:** Add on-chain config snapshot. Closes #225
- Implement chat history pagination with infinite scroll and scroll preservation
- Add accounting invariants for total assets consistency
- Add anti-sandwich delay between deposit and execute
- Add per-thread pinning and priority ordering
- Add configurable withdrawal cooldown after large deposit
- Add skeleton loading system for key panels
- Add telemetry hooks for key chat UX events
- Addcanonical error code registry for contract failures
- **smart-contract:** Add deterministic receipt ID scheme. Closes #223
- **smart-contract:** Add delayed ownership renounce flow. Closes #224
- Add slippage guardrails for price-dependent settlements
- Add protocol upgrades and admin controls
- Add reusable EmptyState component and apply to all major views
- **smart-contract:** Add operator heartbeat and liveness monitoring. Closes #228
- Add optional memo hashing for privacy-preserving receipts
- **contract:** Add denylist, fee vault, and emergency token rescue
- **ui:** Add mobile bottom-sheet pattern for wallet actions
- **contracts:** Add withdrawal queue metrics views
- **chat:** Persist unsent input drafts per thread
- Add advanced filter chips for transaction views
- Add circuit breaker, deploy hash, fixed-point math, and risk-tier queue
- **frontend:** Add token balance display in fiat modal
- **frontend:** Add receipt ID display in chat deposit confirmation
- **contract:** Add get_receipt_by_index query function
- **contract:** Add batch fee withdrawal
- **contract:** Add pause controls and receipt TTL refresh
- **contract:** Add per-token daily deposit limits
- Implement toast notifications with ToastProvider and useToast hook
- Implement toast notifications with ToastProvider and useToast hook
- Add withdrawal expiry handling and reclaim functionality
- Add withdrawal expiry handling and reclaim functionality
- Add type annotation for EMPTY_ARRAY in useToast hook
- Implement withdrawal request and management functionality
- **contract:** Emit structured events with EVENT_VERSION as first topic
- Add theme toggle to landing page and update transitions
- **contract:** Add admin-only get_all_denied_addresses query
- Optimize chat interface for mobile viewports
- **contract:** Prune inactive operators
- **frontend:** Add chat submit keyboard shortcut
- **frontend:** Add payment status, queue badge, chat fallback, and PDF export
- Add operator role for withdrawal processing separate from admin ownership
- Add minimum deposit floor
- **contract:** Cap active operators
- Add split-view comparison, advanced search, and markdown hardening
- **frontend:** Add telemetry consent toggle in user settings
- **frontend:** Persist chat drafts with 500ms debounce
- Add unit test
- **infra:** Add automated Soroban deploy script for FiatBridge on Futurenet
- **frontend:** Add ccip bridge status polling
- **security:** Implement authentication guard for admin endpoints using ADMIN_SECRET
- **contract:** Add per-token allowlist management and get_daily_deposit_record query
- **contract:** Refine get_daily_deposit_record query with window reset logic and test
- Aded the sixes
- Export chat sessions as JSON and text
- **contract:** Implement withdrawal expiry and admin reclaim
- **contract:** Add circuit breaker auto-reset after cooldown
- **contracts:** Add governed upgrade mechanism with delay
- Implement admin overview dashboard with key metrics and wallet guard
- Implement contract event indexing and activity feed in sidebar
- Implement IP allowlist for admin API access
- Implement issues #706 #707 #710 #713
- **contract:** Add invariant and edge case tests for issues #613, #614, #617, #619
- Resolve issues #666, #684, #672, #670 - Error Boundary, Pagination, and Admin Auth Docs
- Implement wave features #62, #699, #695, #687
- **frontend:** Add accessible avatar contrast normalization to chat telemetry
- **frontend:** A11y, theme tokens, and PriceTicker shortcuts
- Cap set_limit, receipt E2E, fiat telemetry, heartbeat invariants
- **frontend:** Debounce transaction filters with optimistic state
- Implement Stellar Wave improvements
- Implement circuit breakers and fee accrual vault
- **frontend:** Add top-level error boundary to StellarChatInterface
- **frontend:** Add Zod validation schema to BankDetailsModal.tsx
- **frontend:** Add optimistic UI updates to ChatHistorySidebar
- **frontend:** Add Zod validation schema to TransactionAmountDisplay.tsx
- **frontend:** Add Zod validation schema to OfflineStatusBanner.tsx
- **contract:** Require admin co-authentication on deposit
- **frontend:** Add accessible contrast to transaction filter chips
- **telemetry:** Add ARIA accessibility labels to chatTelemetry with tests
- **frontend:** Add optimistic UI updates to CCIPBridgeModal.tsx
- **frontend:** Add optimistic UI updates to CCIPBridgeModal.tsx
- **contract:** Implement migration check for validate_withdrawal_quota
- **frontend:** Add keyboard shortcuts to ChatInput.tsx
- **frontend:** Add framer-motion animations to BankDetailsModal
- **frontend:** Add framer-motion animations to BankDetailsModal #556
- **frontend:** Add network status toast to AuditTable
- Implement Stellar Wave improvements
- **contract:** Implement circuit breaker for get_receipt_by_index
- **contract:** Implement admin authentication logic for initialize
- **contract:** Auto-reset circuit breaker on heartbeat
- **BankDetailsModal:** Surface Zod saveCustomName validation as inline error
- **OfflineStatusBanner:** Replace raw Tailwind red classes with CSS variable tokens for WCAG-compliant contrast
- **AdminGuard:** Add offline retry queue for admin verification
- **frontend:** Theme tokens, themed error border, skeleton gate, rapid-click guard
- **stellar-contracts:** Harden get_receipt_by_index boundaries with query events and docs
- Implement issues #579, #540, #597, #587
- **contract:** Implement admin authentication logic for set_emergency_recovery
- **contract:** Implement event emission schema for withdraw_fees
- Fix contract validation, deposit safety and admin UI improvements
- Address issues #696, #838, #839, and #840 in one release
- **frontend:** Add clipboard copy buttons to admin audit log
- **contract:** Harden daily withdrawal quota validation and emit usage event
- **frontend:** Add skeleton loading state to OfflineStatusBanner
- Implement tests for issues #702 #832 #837 #681
- **frontend:** Add offline retry queue to AuditTable.tsx
- **contract:** Implement circuit breaker for request_withdrawal
- **contract:** Implement circuit breaker for request_withdrawal and slippage threshold assertion for get_accrued_fees
- **contract:** Implement invariant test for get_accrued_fees
- **frontend:** Add French and Spanish i18n locales with browser auto-detection
- **chat:** Cmd/Ctrl+K global search toggle, pinned drag-and-drop, and sessionStorage drafts; virtualise history sidebar
- **receipt:** Add print functionality and QR code rendering
- **receipt:** Enhance receipt printing and QR code functionality
- CI workflows, devcontainer, and contract rustdoc (#981, #983, #1000, #1001)
- **frontend:** Accessibility, reduced-motion, empty-state, error monitoring
- Rate limiting, version guard, deep-link, and integration tests
- Implement batch deposit functionality for multiple token deposits
- **frontend:** Add CSV export button to AuditTable
- Implement swipe-to-dismiss, toast viewport cap, high-contrast buttons, and chat state machine ADR
- **frontend:** Add confirmation dialog with typed-confirm for Clear Audit Logs
- **frontend:** Persist offline message queue to IndexedDB and show pending count in banner
- **frontend:** Enhance admin reconciliation E2E tests and dashboard functionality
- Telemetry motion, dark-mode chip fallback, debounced dispatch, request_withdrawal invariants
- **contract:** Return 0 from get_total_deposited on empty state #1023
- **frontend:** Add transaction status polling with SSE fallback in useChat.ts
- **frontend:** Export stellarAddressSchema from AdminGuard and fix theme tokens
- **contract:** Implement overflow prevention for is_denied
- **contract:** Implement circuit breaker event for get_receipt_by_index
- **frontend:** Emoji refocus, connection indicator, and wallet watchlist (#1020 #1030 #1032)
- **contract:** Add slippage threshold assertion for execute_batch_admin
- Add copy button visibility improvements, online status fix, E2E tests, and snapshot tests
- Show XLM balance in chat header and add frontend build CI workflow
- Implement frontend security and UX enhancements
- **frontend:** Add chat live region announcements (#1180, #1181)

### Fixed

- Add missing Ledger import and fix sequence_number field name in tests
- Integrate receipt system with allowlist branch
- Properly integrate multi-token + receipt system features
- **contract:** Resolve massive merge conflict corruption in lib.rs & tests
- Resolve TypeScript lint errors for CI compliance
- **UserSettings:** Escape apostrophe to resolve lint error
- **useChat:** Include isAdmin in clearChat and loadChatSession state updates
- Remove rlib from crate-type to resolve wasm duplicate lang item error
- Require admin authorization before reading state in withdraw
- Extend instance storage TTL for state-mutating functions
- Move all test code into gated module, format codebase
- Resolve merge conflicts, build, test, and format codebase
- Resolve failing unit tests and partial withdrawal logic
- Move all test code into gated module, format codebase
- Schema version key, contract client macro, and test suite now clean and passing
- Remove duplicate admin files from root src
- **frontend:** Add missing framer-motion dependency and verify build
- **deposit:** Add client-side validation for amount field inputs
- **frontend:** Resolve memory leak in Message.tsx
- Resolve CI type and contract test failures
- Regenerate package-lock.json files with valid JSON structure
- Restore test.rs to clean version from commit dcddc9f
- Regenerate package-lock files with valid JSON structure and fresh npm install
- Repair invalid JSON in package-lock.json (missing closing brace)
- Resolve build failures - add missing import and remove undefined functions
- Remove unused import in chat pagination test file
- Restore ChatMessages.tsx to clean working version
- Resolve CI build failures and type check errors
- Resolve ESLint no-explicit-any failures in translation logic
- Comprehensive type-safety cleanup in ChatInput and TranslationContext
- **frontend:** Resolve TypeScript NestedKeyOf type error and ESLint no-explicit-any in TranslationContext.tsx
- Remove duplicate imports and define missing variable
- Remove unused Loader2 import from ChatMessages
- Relax emit generic constraint to satisfy TypeScript strict index signature check
- Resolve merge conflicts in FiatBridge and integrate protocol enhancements
- Restore missing Issue #228 (Operator/heartbeat) functionality
- Resolve stale state in PR #267 and implement deterministic hash IDs
- **chat:** Add react-is dependency and fix lint errors
- Resolve all post-merge compilation errors and test failures
- Remove unused hasActiveFilters variable in ReceiptDrawer
- Resolve TypeScript type error in toggleFilter function
- Wrap ReceiptDrawer in dynamic import to prevent SSR issues with useSearchParams
- **frontend:** Handle wallet disconnection without crashing chat
- **306:** Suppress hydration warning on html element for theme data-attribute
- **contract:** Enforce boundary-inclusive slippage check
- **contract:** Use ceiling division and strict inequality for slippage
- **contract:** Downgrade soroban-sdk to 21.0 to resolve events() resolution issue
- Resolve issues 315, 313, 307, 318
- **security,dx:** Move Gemini key server-side, fail-closed webhook, add Vitest coverage gate
- **contract:** Validate memo_hash zero-value in deposit and request_withdrawal
- Resolve all post-pull warnings and lint issues
- Added copy to clipboard
- Added copy to clipboard
- Fixed checks
- Remove duplicate test code causing compilation error
- Fixed checks
- **contract:** Resolve batch event publish args and clippy test pattern
- Resolve CI failures (frontend dead code and backend formatting)
- **contract:** Correct batch event publish call for ci
- **contract:** Correct batch_ok event publish signature
- **contracts:** Correct batch admin event publish shape
- Prevent withdraw to contract's own address
- Add overflow guard to total_deposited accumulators
- Fixed compile issues
- Remove extra batch_ok event publish arg
- Resolve build failures in ChatHistorySidebar JSX and lib.rs event publish
- Widen img component props type to satisfy react-markdown signature
- **contract:** Prevent ReceiptIndex from using persistent storage for short-lived entries
- **contract:** Preventing ReceiptIndex from premature eviction and failing ttl extension
- Combined fixes for issues #390, #391, #294, #301
- Add missing closing braces in test functions
- Correct Zod error property and CSV export fields
- Transfer_admin's current admin validation bug
- **frontend:** Resolve JSX parse errors introduced by merged PRs
- **test:** Correct exact slippage boundary formulation
- **frontend:** Resolve JSX parse errors introduced by merged PRs
- **contracts:** Restore soroban-sdk v25.3.0 and fix slippage syntax error
- **contracts:** Expose WINDOW_LEDGERS publicly and add get_denied_addresses tests
- **contracts:** Repair snapshot test compilation
- **contracts:** Align quota reset snapshot test with real flow
- **contract:** Protect accumulators against i128 overflow using checked_add and InternalError
- **contract:** Migrate all events to #[contractevent] structs (deprecation cleanup)
- **contract:** Prevent admin from renouncing ownership while paused
- CI fix
- Added inline JSDoc to all public functions in aiAssistant.ts
- Added WalletActionSheet haptic feedback on mobile
- Added TypeScript strict type-check step (no build artefacts)
- Added unit tests for chatStateMachine
- Admin type safety, refactor, and styling guidelines (closes #460, #461, #462, #463)
- Correct assertion in request_withdrawal edge case test
- **frontend:** Stabilize useFeatureFlag hydration behavior
- Resolve CI blockers, repair sidebar duplication, and fix contract test syntax
- Resolve frontend type errors and repair contract tests
- Resolve CI blockers - add TranslationProvider, repair test.rs syntax, and refactor toastStore for type safety
- Resolve frontend CI tests and dependencies
- Prevent AdminGuard stale updates and improve replay docs
- **contract:** Correct edge case validation in upgrade
- Resolve linting and type errors
- Docs, Zod modal validation, feature-flag borders, audit fetch race
- **frontend:** Use theme border on chat history sidebar
- Address multiple issues
- **contract:** Correct edge case validation in initialize and prevent re-initialization
- **frontend:** Resolve memory leak tightly associated with chatTelemetry.ts
- **contract:** Correct edge case validation in withdraw_fees
- **frontend:** Replace hardcoded gradients in StellarChatInterface with theme tokens
- Resolve rendering overflow in chatTelemetry and add optimistic UI to CCIPBridgeModal
- **contract:** Explicit boundary errors in get_receipt_by_index
- **frontend:** Resolve hydration mismatch in useBeneficiaries.ts
- **frontend:** Resolve race condition in useChat.ts
- **contract:** Correct edge case validation in initialize
- **contract:** Correct edge case validation in heartbeat
- **frontend:** Remove useFeatureFlag render race
- **contract:** Validate set_limit boundaries
- Rules of Hooks in TransactionAmountDisplay, ErrorBoundary fallback, keyboard shortcuts in NotificationsCenter, expanded tests
- **contract:** Resolve 4 issues — request_withdrawal circuit breaker, deposit event schema, set_emergency_recovery invariants, set_limit boundary checks
- JSX div structure, auto-scroll, accessible contrast, feature flag telemetry
- **contract:** Harden upgrade validation and add Message E2E coverage
- **frontend:** Render deterministic state-aware border colour in ChatInput
- **frontend:** Resolve hydration mismatch from platform detection in ChatInput
- Replace landing page gradients with theme color tokens
- **contract:** Correct edge case validation in heartbeat maximum cap limit
- Suppress unnecessary_cast clippy warning in set_max_operators
- Ci error
- Ci error
- Add missing MaxSignersReached error variant and fix imports
- Update get_receipt_by_index calls and switch CI to pnpm
- Reorder workflow steps - pnpm setup before Node.js cache
- Use try_get_receipt_by_index for error assertions
- Remove _unreadCount from NotificationsCenter destructuring
- Add add_Soroban_invariant_test branch to workflow triggers
- Remove unused eslint-disable directives and fix parsing error
- Remove duplicate test functions, fix missing variables, fix irrefutable if let patterns, fix unused variable
- Fix missing variables, fix execute_withdrawal arguments, fix irrefutable if let pattern
- Add scrollIntoView mock and fix ThemeProvider wrapper in SplitViewComparison tests
- Add scrollIntoView mock, fix ThemeProvider wrapper, add optional chaining to tests
- Add ThemeProvider to ThemeContext mocks in test files
- Fix remaining Rust compilation errors
- Fix token_client variable naming in test_issue_832.rs
- Remove unused Ledger import in test_issue_702.rs
- Fix remaining Rust compilation errors
- Cast executable_after to u64 in UpgradeProposedEvent
- Add ThemeProvider mock to frontend test files
- **ci:** Update lint-staged paths for Dechat project layout
- **frontend:** Resolve StellarFiatModal loading status type narrowing
- **frontend:** Stabilize coverage CI and network queue test teardown
- **frontend:** Remove invalid coverage.all option from vitest config
- **ci:** Shard coverage runs to prevent vitest worker OOM
- **frontend:** Reset search state on ChatSearchPanel close
- **frontend:** Apply sliding window to conversation history in aiAssistant
- **contracts:** Enforce 48-hour timelock on admin transfer
- **frontend:** Persist locale to localStorage in TranslationContext
- **frontend:** Add language preference selector to UserSettings
- **frontend:** Show EmptyState when both comparison panes are empty
- **frontend:** Truncate long transaction hashes with ellipsis and hover title
- **frontend:** Enforce 7 decimal places for small XLM amounts
- **ci:** Add path filter to contract-tests workflow to skip when stellar-contracts unchanged
- **ci:** Guard contract test steps against missing stellar-contracts directory
- **ci:** Ensure contract-tests always passes when stellar-contracts is absent
- **frontend:** Handle wallet disconnect mid-transfer in WalletConnectionTimeline
- **frontend:** Invalidate stale fee estimate on network switch in CCIPBridgeModal
- **frontend:** Add client-side IBAN format validation to BankDetailsModal
- **frontend:** Preserve pagination page when sorting columns in AuditTable
- Resolve contract CI compile errors and locale TypeScript failures
- **frontend:** Clear lint errors in TranslationContext and BankDetailsModal
- **contract:** Math.rs integer overflow in fee calculation for large deposit amounts #966
- **receipt:** Resolve layout issues in ReceiptDrawer component
- Resolve merge conflicts and CI failures on add_print_stylesheet
- **frontend:** Use valid vitest reporter for coverage merge step
- **test:** Stop flaky chatHistory export timestamp comparison
- Address layout issues in ReceiptDrawer component for improved printing
- **e2e:** Stabilize bank payout and offline reconnect Playwright tests
- **e2e:** Enhance reliability of bank payout and offline reconnect tests
- **contract:** Resolve clippy warnings and repair math.rs merge
- **frontend:** Prevent state updates after unmount in useBridgeStats
- **frontend:** Debounce search in useChatHistory to prevent per-keystroke queries
- **frontend:** Add exponential backoff reconnect and stale-data indicator to PriceTicker
- **#1031,#1009,#1040,#1013:** Fee accrual view, batch deposit, JSDoc types, upgrade runbook
- **frontend:** Remove invalid pnpm-workspace.yaml breaking CI install
- **contract:** Remove unnecessary u32 cast in deposit_batch
- **dechat:** Resolved all issues to match task description #965, #959, #976
- **dechat:** Resolved all issues in one: #975, #977, #969
- Resolved admin reconciiation
- **frontend:** NotificationsCenter badge reads unread count from store directly, fixing stale count on mark-all-read
- **contract:** Resolve test compile and clippy errors after main merge
- **frontend:** Handle missing IndexedDB in offline message queue
- **frontend:** Improve error handling for offline message queue
- **frontend:** Enhance offline message queue resilience by adding fallback for unavailable IndexedDB
- **tests:** Correct operation name in E2E helper function for Stellar transactions
- **contract:** Add pause finalization guard, fee monotonicity tests, and verify set_limit zero-rejection
- **contract:** Reject zero address in set_emergency_recovery #1026
- **contract:** Validate token implements SEP-41 interface in init #1037
- **contract:** Validate withdrawal amount against user deposit #1017
- **contract:** Correct edge case validation in withdraw_fees
- Correct mismatched delimiters in checked_mul_div_floor and checked_mul_div_ceil
- **test:** Add missing UserPreferencesContext mock in rapid-click test
- Resolve all clippy/test errors - add missing methods, fix API mismatches, oracle staleness types
- **hook:** Add fetchCount, lastFetchedAt, and telemetry events to useBridgeStats
- Remove duplicate get_fee_withdrawal_nonce body causing unexpected closing delimiter
- **tests:** Correct 56-char Stellar addresses in AdminGuard test and add UserPreferencesContext mock to StellarFiatModal test
- ContractEvents.events().len(), Ok(Ok(None)) for try_get_receipt, unwrap moved value
- Allow dead_code on reject_if_denied helpers, fix moved receipt unwrap
- Clippy len_zero and mismatched lifetime syntaxes
- Remove stale Stellar-Dex-Chat submodule reference and fix frontend-build.yml paths
- Add require_circuit_breaker_clear, set_operator guards, set_max_operators boundary, InsufficientFunds check, execute_batch_admin role guard, snapshot token mints
- All 6 remaining test failures - events, circuit breaker threshold, operator guards
- **ci:** Repair clippy, changelog, WASM size gate and auto-merge
- **ci:** Unbreak contract build on current stable and drop git-cliff-action

### Changed

- **api:** Use payout provider registry
- Add next-env types
- Update lockfile
- Add GitHub Actions workflows for frontend and smart contract builds
- Add permissions block to allow workflows to run without manual approval
- Added CONTRIBUTING.md file
- Run cargo fmt and update test snapshots
- Update dex_with_fiat_frontend package-lock
- Ensure test module is gated and all tests pass
- Format codebase after recent changes
- Add .gitignore entries for generated build artifacts
- Comment out minimal event emission test, all tests passing, code formatted and builds cleanly
- Add .env.example file for the frontend
- Extract XLM stroop conversion utilities into shared helper module
- **chat:** Improve code readability and formatting in StellarChatInterface and StellarFiatModal
- Integrate FSM with existing features and update tests
- Remove temporary build output files
- Resolve package-lock.json merge conflict
- **contracts:** Cover queue metrics lifecycle
- Document queue metrics views
- **contracts:** Fix queue metrics tests for new deposit/withdraw sig
- **chat:** Sync package-lock.json with package.json
- **chat:** Sync all lock files and fix missing dependency memoize-one
- Specify working-directory for npm ci to fix dependency issues
- **311:** Cache Next.js build artifacts in GitHub Actions
- **309:** Add FIAT_BRIDGE_README with BytesN<32> receipt IDs and ReceiptIndex
- **312:** Add proptest property-based tests for deposit amount invariants
- **contract:** Update Cargo.lock
- Improve formatting and error handling in arithmetic functions
- Clean up code formatting and improve readability in lib.rs
- **contract:** Support mixed batch admin outcomes
- **contract:** Add invariant test for escrow accounting after migratio
- **contract:** Add test for per-token daily deposit limit enforcement
- Expand README with project architecture overview
- Add cargo clippy checks to contract workflows
- Rerun actions
- **contract:** Add per-user quota reset isolation test
- **contracts:** Apply cargo fmt after verification
- Rerun ci for chat shortcut PR
- I added playwright test
- **contracts:** Apply cargo fmt after branch sync
- **lib:** Add unit tests for rateLimit utility
- Undo change
- Add auto-merge workflow for PRs that pass all checks
- Add auto-merge workflow for PRs that pass all checks
- **contracts:** Add event snapshot coverage
- **contract:** Add unit tests for daily deposit record, token allowlist, and overflow check
- Add SDK usage examples for TypeScript client bindings
- Add .env.example and update setup instructions
- **contract:** Add request_withdrawal invariant property tests
- Improve inline documentation for admin authentication logic
- Cleanup vscode settings
- **contract:** Pause and batch admin invariants; feat(frontend): network toasts
- **contract:** Comprehensive coverage of set_limit critical paths
- Resolve merge conflict in CCIPBridgeModal test
- Improve inline documentation for maximum cap limit
- **contract:** Add Soroban invariant tests for get_receipt_by_index
- **contract:** Add Soroban invariant tests for request_withdrawal
- **contract:** Add integration tests for issues #504, #511, #600
- Update pr.md with changes for issues #504, #511, #600 and init fix
- **admin:** Strengthen colour-token assertions to cover all acceptance criteria
- Enhance replay protection and inactivity threshold documentation
- Enhance inline documentation for daily limit validation and timelock role check
- Fix error descriptions for daily limit and timelock errors
- Update public API reference for daily limit and operator functions
- Add architectural guides for daily deposit limit and admin timelock
- Improve inline documentation for fee accrual vault
- **contract:** Add Soroban invariant tests for deposit
- Implemented changes across chat history, notificaitions and price ticker
- **e2e:** Add comprehensive test coverage and keyboard shortcuts
- Streamline project structure and update paths for consistency
- Remove unused invariant checks and streamline test setup
- Update vitest configuration and enhance component tests
- Enhance component test coverage and improve error handling
- Improve test coverage and streamline component error handling
- Enhance test coverage and improve error handling in components
- Enhance test stability and coverage in CI
- Improve test stability and coverage in CI
- Enhance CI test stability and coverage settings
- Update test coverage configuration and CI workflow
- **math:** Enhance multiplication and division functions with overflow checks
- **math:** Implement checked multiplication and division functions
- Add PR description for issues #962, #956, #949, #961
- Add CONTRIBUTING.md with branch naming, PR, and commit message conventions
- Retrigger contract tests after test.rs token fix
- Update contract tests to reflect recent changes in token handling and lifetimes
- Update .gitignore to include pnpm workspace configuration file
- Retrigger frontend after pnpm-workspace.yaml removal
- **tests:** Update admin reconciliation E2E tests for improved selectors and access control
- **tests:** Streamline admin reconciliation E2E tests with improved mocks and selectors
- **tests:** Update admin reconciliation E2E tests with improved mock data and selectors
- **tests:** Enhance admin reconciliation E2E tests with updated mock data and selectors
- **tests:** Update E2E tests to use dynamic wallet address and improve modal interactions
- **tests:** Optimize E2E tests for Stellar Fiat Modal with dynamic selectors and enhanced checks
- **tests:** Enhance E2E tests for Stellar Fiat Modal with improved dynamic selectors and checks
- **tests:** Update E2E tests for Stellar Fiat Modal with enhanced dynamic selectors and checks
- **tests:** Enhance E2E helper function for Stellar wallet connection
- **tests:** Enhance E2E tests for Stellar wallet connection with improved error handling
- **tests:** Improve E2E tests for Stellar wallet connection with enhanced error handling and logging
- **contract:** Enhance error handling for denied addresses in FiatBridge
- **tests:** Enhance E2E tests for Stellar wallet connection with improved error handling and logging
- **frontend:** Cover idempotent action deduplication
- **contract:** Add regression tests for #1017 #1023 #1026 #1037
- Improve circuit breaker documentation
- Improve circuit breaker inline docs
- Fix circuit breaker guide spacing
- **changelog:** Update changelog [skip ci]

### Deprecated

- Merge branch 'main' into fix/deprecation-cleanup
- Merge branch 'fix/deprecation-cleanup' of https://github.com/markdavid000/Stellar-Dex-Chat into fix/deprecation-cleanup
- Merge branch 'main' into fix/deprecation-cleanup
- Merge pull request #438 from markdavid000/fix/deprecation-cleanup

Fix/deprecation cleanup
- Update StellarFiatModal.tsx

fixed the replace deprecated stroopsToXlm export in stroops
- Merge pull request #447 from onyillto/replace-deprecated-stroops

Update StellarFiatModal.tsx

### Removed

- Add nonce-based replay protection for operator actions

Implements monotonically increasing nonce validation for operator-authorized
operations to prevent replay attacks.

Changes:
- Added OperatorNonce(Address) storage key to track nonces per operator
- Added InvalidNonce (901) and StaleNonce (902) error codes
- Added get_operator_nonce() public function to query current nonce
- Added validate_and_increment_nonce() internal function for validation
- Updated heartbeat() function to require and validate nonces
- Added 13 comprehensive tests covering replay attack scenarios
- Updated ERROR_CODES.md with new error codes and missing codes
- Created NONCE_REPLAY_PROTECTION.md documentation

Acceptance Criteria Met:
✓ Require monotonically increasing nonce for operator actions
✓ Persist and validate nonce per operator
✓ Reject stale or duplicate nonces
✓ Add tests covering replay attempts

Breaking Change:
The heartbeat() function signature has changed from:
  heartbeat(env: Env, operator: Address)
to:
  heartbeat(env: Env, operator: Address, nonce: u64)

Clients must be updated to track and provide nonces.
- Fix frontend CI build errors

- Remove unused idempotencyKey state variable in StellarFiatModal
- Remove unnecessary eslint-disable for TransactionData import in chatStateMachine
- Add conversationState to sendMessage dependency array in useChat
- Add eslint-disable comment for intentional stateUpdateTrigger dependency

Fixes:
- Error: 'idempotencyKey' is assigned a value but never used
- Warning: Unused eslint-disable directive
- Warning: Missing dependency 'conversationState.isAdmin'
- Warning: Unnecessary dependency 'stateUpdateTrigger' (intentional, now documented)
- Remove unused uuidv4 import from StellarFiatModal

The uuidv4 import is no longer needed after removing the unused
idempotencyKey state variable.
- Resolve merge conflicts in implement_overflow branch

- Resolved conflicts in .github/workflows/frontend.yml by merging CI steps
- Resolved conflicts in dex_with_fiat_frontend/src/components/Message.tsx by consolidating imports and JSX
- Resolved conflicts in dex_with_fiat_frontend/src/lib/env.ts by adding typeof process checks
- Resolved conflicts in dex_with_fiat_frontend/src/lib/featureFlags.ts by adding typeof process checks and enableHaptics flag
- Resolved conflicts in stellar-contracts/src/lib.rs by merging Error enum and function implementations
- Resolved conflicts in stellar-contracts/src/test.rs by merging test imports and allowlist tests
- Removed PULL_REQUEST_MESSAGE.md as it was deleted in main branch
- All conflicts have been cleanly merged to preserve functionality from both branches
- Fix all CI issues to ensure GitHub workflow passes

- Fixed React hooks rules violation in TransactionAmountDisplay.tsx by moving hooks before conditional returns
- Removed unused variables and imports (sanitizeUrl, fadeInVariants, useCallback, isStatusLoading)
- Fixed missing dependency in BankDetailsModal.tsx useCallback
- Fixed stellar-contracts syntax errors (unclosed delimiters, merge conflict markers)
- Removed duplicate error codes in Error enum that were causing compilation errors
- Updated ESLint config to disable @typescript-eslint/no-explicit-any for test files
- All CI workflows now pass: frontend type check, lint, build, and stellar-contracts build/tests
- Fix all remaining CI issues to ensure GitHub workflow passes

- Fixed remaining merge conflict markers in stellar-contracts/src/lib.rs and src/test.rs
- Removed duplicate function definitions (accept_admin) with conflicting signatures
- Added missing DataKey variants (MultisigProposal, Signers, Threshold)
- Removed duplicate error codes from Error enum causing #[contracterror] macro failures
- Updated ESLint config to disable @typescript-eslint/no-require-imports for test files
- All CI workflows now pass:
  * Frontend: type check, lint, build
  * Smart contracts: build, tests, WASM compilation
  * Contract tests: all test suites execute successfully
- Resolve issues #586 #1005 #1019 #1022

### Security

- Merge remote-tracking branch 'origin/main' into feature/admin-security-enhancements
- Merge pull request #168 from pope-h/feature/admin-security-enhancements

feat: implement admin security enhancements
- Merge pull request #434 from Temi-suwa18/fix/issues-345-348-374-security-coverage

fix(security,dx): move Gemini key server-side, fail-closed webhook, add coverage gate
- Merge pull request #918 from Samuel1505/memo

feat:Contract Security: initialize, heartbeat, and get_receipt_by_index
- Merge pull request #925 from Depo-dev/feat/dexchat-contract-ui-security-batch-492-499-452-490

feat: fix contract validation, deposit safety and admin UI improvements
- Merge pull request #1076 from designsage8/feature/frontend-security-ux-enhancements

feat: implement frontend security and UX enhancements