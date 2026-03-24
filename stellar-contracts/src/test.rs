#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env,
};

// ── helpers ──────────────────────────────────────────────────────────

fn create_token<'a>(
    e: &Env,
    admin: &Address,
) -> (Address, TokenClient<'a>, StellarAssetClient<'a>) {
    let addr = e
        .register_stellar_asset_contract_v2(admin.clone())
        .address();
    (
        addr.clone(),
        TokenClient::new(e, &addr),
        StellarAssetClient::new(e, &addr),
    )
}

fn setup_bridge(
    env: &Env,
    limit: i128,
) -> (
    Address,
    FiatBridgeClient,
    Address,
    Address,
    TokenClient,
    StellarAssetClient,
) {
    let contract_id = env.register(FiatBridge, ());
    let bridge = FiatBridgeClient::new(env, &contract_id);
    let admin = Address::generate(env);
    let token_admin = Address::generate(env);
    let (token_addr, token, token_sac) = create_token(env, &token_admin);
    // The generated client panics on contract errors; unwrap is valid here
    bridge.init(&admin, &token_addr, &limit);
    (contract_id, bridge, admin, token_addr, token, token_sac)
}

// ── happy-path tests ──────────────────────────────────────────────────

#[test]
fn test_deposit_and_withdraw() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, bridge, _, _, token, token_sac) = setup_bridge(&env, 500);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);

    bridge.deposit(&user, &200);
    assert_eq!(token.balance(&user), 800);
    assert_eq!(token.balance(&contract_id), 200);

    // Default lock period is 0
    let req_id = bridge.request_withdrawal(&user, &100);
    bridge.execute_withdrawal(&req_id);

    assert_eq!(token.balance(&user), 900);
    assert_eq!(token.balance(&contract_id), 100);
}

#[test]
fn test_time_locked_withdrawal() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, bridge, _, _, token, token_sac) = setup_bridge(&env, 500);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);
    bridge.deposit(&user, &200);

    bridge.set_lock_period(&100);
    assert_eq!(bridge.get_lock_period(), 100);

    let start_ledger = env.ledger().sequence();
    let req_id = bridge.request_withdrawal(&user, &100);

    // Check request details
    let req = bridge.get_withdrawal_request(&req_id).unwrap();
    assert_eq!(req.to, user);
    assert_eq!(req.amount, 100);
    assert_eq!(req.unlock_ledger, start_ledger + 100);

    // Try to execute too early
    let result = bridge.try_execute_withdrawal(&req_id);
    assert_eq!(result, Err(Ok(Error::WithdrawalLocked)));

    // Advance ledger
    env.ledger().with_mut(|li| {
        li.sequence_number = start_ledger + 100;
    });

    bridge.execute_withdrawal(&req_id);
    assert_eq!(token.balance(&user), 900);
    assert_eq!(token.balance(&contract_id), 100);
    assert_eq!(bridge.get_withdrawal_request(&req_id), None);
}

#[test]
fn test_cancel_withdrawal() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, token_sac) = setup_bridge(&env, 500);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);
    bridge.deposit(&user, &200);

    let req_id = bridge.request_withdrawal(&user, &100);
    assert!(bridge.get_withdrawal_request(&req_id).is_some());

    bridge.cancel_withdrawal(&req_id);
    assert!(bridge.get_withdrawal_request(&req_id).is_none());

    let result = bridge.try_execute_withdrawal(&req_id);
    assert_eq!(result, Err(Ok(Error::RequestNotFound)));
}

#[test]
fn test_view_functions() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, admin, token_addr, _, token_sac) = setup_bridge(&env, 300);
    let user = Address::generate(&env);
    token_sac.mint(&user, &500);

    assert_eq!(bridge.get_admin(), admin);
    assert_eq!(bridge.get_token(), token_addr);
    assert_eq!(bridge.get_limit(), 300);
    assert_eq!(bridge.get_balance(), 0);
    assert_eq!(bridge.get_total_deposited(), 0);

    bridge.deposit(&user, &200);
    assert_eq!(bridge.get_balance(), 200);
    assert_eq!(bridge.get_total_deposited(), 200);

    bridge.deposit(&user, &100);
    assert_eq!(bridge.get_total_deposited(), 300);
}

#[test]
fn test_set_limit() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, _) = setup_bridge(&env, 100);
    bridge.set_limit(&500);
    assert_eq!(bridge.get_limit(), 500);
    bridge.set_limit(&50);
    assert_eq!(bridge.get_limit(), 50);
}

#[test]
fn test_transfer_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, _) = setup_bridge(&env, 100);
    let new_admin = Address::generate(&env);
    bridge.transfer_admin(&new_admin);
    assert_eq!(bridge.get_admin(), new_admin);
}

// ── error-case tests ──────────────────────────────────────────────────

#[test]
fn test_over_limit_deposit() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, token_sac) = setup_bridge(&env, 500);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);

    let result = bridge.try_deposit(&user, &600);
    assert_eq!(result, Err(Ok(Error::ExceedsLimit)));
}

#[test]
fn test_zero_amount_deposit() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, _) = setup_bridge(&env, 500);
    let user = Address::generate(&env);

    let result = bridge.try_deposit(&user, &0);
    assert_eq!(result, Err(Ok(Error::ZeroAmount)));
}

#[test]
fn test_insufficient_funds_withdraw() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, token_sac) = setup_bridge(&env, 500);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);
    bridge.deposit(&user, &100);

    let req_id = bridge.request_withdrawal(&user, &200);
    let result = bridge.try_execute_withdrawal(&req_id);
    assert_eq!(result, Err(Ok(Error::InsufficientFunds)));
}

#[test]
fn test_double_init() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, admin, token_addr, _, _) = setup_bridge(&env, 500);
    let result = bridge.try_init(&admin, &token_addr, &500);
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}

// ── fee tests ─────────────────────────────────────────────────────────

#[test]
fn test_fee_collection_on_deposit() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, bridge, _, _, token, token_sac) = setup_bridge(&env, 2_000);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);

    bridge.set_fee(&100);
    bridge.deposit(&user, &1_000);

    // fee = (1000 * 100) / 10_000 = 10; net = 990
    assert_eq!(token.balance(&user), 10);
    assert_eq!(token.balance(&contract_id), 990);
    assert_eq!(bridge.get_fee_accrued(), 10);
    assert_eq!(bridge.get_total_deposited(), 990);
}

#[test]
fn test_zero_fee_bps_full_amount_locked() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, bridge, _, _, token, token_sac) = setup_bridge(&env, 1_000);
    let user = Address::generate(&env);
    token_sac.mint(&user, &500);

    // fee_bps defaults to 0 — no fee deducted, no event emitted
    bridge.deposit(&user, &500);

    assert_eq!(token.balance(&user), 0);
    assert_eq!(token.balance(&contract_id), 500);
    assert_eq!(bridge.get_fee_accrued(), 0);
    assert_eq!(bridge.get_total_deposited(), 500);
}

#[test]
fn test_sweep_fees_zero_accrued_returns_error() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, _) = setup_bridge(&env, 1_000);
    let recipient = Address::generate(&env);

    let result = bridge.try_sweep_fees(&recipient);
    assert_eq!(result, Err(Ok(Error::ZeroAmount)));
}

#[test]
fn test_set_fee_exceeds_limit() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, _) = setup_bridge(&env, 1_000);

    let result = bridge.try_set_fee(&1_001);
    assert_eq!(result, Err(Ok(Error::ExceedsLimit)));
}

// ── daily withdrawal limit tests ──────────────────────────────────────

/// A single withdrawal call that exceeds the daily limit returns DailyLimitExceeded.
#[test]
fn test_daily_limit_single_call_exceeded() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, token_sac) = setup_bridge(&env, 1_000);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);
    bridge.deposit(&user, &500);

    // Daily limit: 100 tokens
    bridge.set_daily_limit(&100);

    let req_id = bridge.request_withdrawal(&user, &200);
    let result = bridge.try_execute_withdrawal(&req_id);
    assert_eq!(result, Err(Ok(Error::DailyLimitExceeded)));
}

/// Multiple withdrawals within the same window that cumulatively exceed
/// the daily limit are correctly blocked.
#[test]
fn test_daily_limit_multi_call_exceeded() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, _, token_sac) = setup_bridge(&env, 1_000);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);
    bridge.deposit(&user, &500);

    // Daily limit: 200 tokens
    bridge.set_daily_limit(&200);

    // First withdrawal of 150 — within the limit.
    let req1 = bridge.request_withdrawal(&user, &150);
    bridge.execute_withdrawal(&req1);

    // Second withdrawal of 100 — 150 + 100 = 250 > 200, should be blocked.
    let req2 = bridge.request_withdrawal(&user, &100);
    let result = bridge.try_execute_withdrawal(&req2);
    assert_eq!(result, Err(Ok(Error::DailyLimitExceeded)));

    // Confirm get_window_withdrawn reflects the first withdrawal.
    assert_eq!(bridge.get_window_withdrawn(), 150);
}

/// After the 24-hour window expires the full daily limit is available again.
#[test]
fn test_daily_limit_window_reset() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, token, token_sac) = setup_bridge(&env, 1_000);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);
    bridge.deposit(&user, &600);

    bridge.set_daily_limit(&200);

    // Withdraw up to the daily limit.
    let req1 = bridge.request_withdrawal(&user, &200);
    bridge.execute_withdrawal(&req1);
    assert_eq!(bridge.get_window_withdrawn(), 200);
    assert_eq!(bridge.get_window_remaining(), 0);

    // Advance ledger past the window boundary (~17 280 ledgers).
    let start = env.ledger().sequence();
    env.ledger().with_mut(|li| {
        li.sequence_number = start + 17_280;
    });

    // Window has reset — a new 200-token withdrawal should succeed.
    let req2 = bridge.request_withdrawal(&user, &200);
    bridge.execute_withdrawal(&req2);
    assert_eq!(token.balance(&user), 800); // 400 deposited (net), 400 withdrawn
}

/// Setting the daily limit to 0 disables the cap (backward-compatible default).
#[test]
fn test_daily_limit_zero_disables_cap() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, bridge, _, _, token, token_sac) = setup_bridge(&env, 1_000);
    let user = Address::generate(&env);
    token_sac.mint(&user, &1_000);
    bridge.deposit(&user, &500);

    // Daily limit stays at 0 (default) — large withdrawal must succeed.
    let req_id = bridge.request_withdrawal(&user, &500);
    bridge.execute_withdrawal(&req_id);
    assert_eq!(token.balance(&user), 1_000);

    // Explicitly set to 0 and confirm get_window_remaining returns i128::MAX.
    bridge.set_daily_limit(&0);
    assert_eq!(bridge.get_daily_limit(), 0);
    assert_eq!(bridge.get_window_remaining(), i128::MAX);
}
