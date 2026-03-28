# FiatBridge Contract Documentation

The `FiatBridge` contract manages asset-to-fiat bridges on the Stellar network.

## Public Queries

Operational dashboards and monitoring tools can use these read-only functions to track contract state.

### `get_accrued_fees(token: Address) -> i128`
Returns the total amount of fees currently accrued for the specified token that have not yet been withdrawn by the administrator.

### `get_wq_depth() -> u64`
Returns the current number of withdrawal requests present in the withdrawal request queue.

### `get_wq_oldest_queued_ledger() -> Option<u32>`
Returns the ledger sequence when the oldest currently-pending withdrawal request was queued. Returns `None` when the queue is empty.

### `get_wq_oldest_age_ledgers() -> Option<u32>`
Returns the age of the oldest currently-pending withdrawal request in units of ledgers. Returns `None` when the queue is empty.

### `get_balance() -> i128`
Returns the current balance of the bridged token held by the contract.

### `get_total_deposited() -> i128`
Returns the cumulative total of all deposits made to the contract.

## Admin Operations

Admin operations are subject to a timelock delay and emit events for transparency.

### `queue_admin_action(action_type: Symbol, payload: Bytes, delay: u32) -> u64`
Queues an administrative action (e.g., changing limits).
- **Events**: Emits `admin_action_queued { action_type, action_id, target_ledger }`.

### `execute_admin_action(action_id: u64)`
Executes a previously queued action once the timelock has expired.
- **Events**: Emits `admin_action_executed { action_id, success }`.
