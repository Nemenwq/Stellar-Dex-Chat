//! Comprehensive tests for `request_withdrawal`.
//!
//! Covers all error paths, state mutations, and invariants that the existing
//! proptest and edge-case tests leave unaddressed.

#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::StellarAssetClient,
    Address, Bytes, BytesN, Env,
};

// ── Test helpers ─────────────────────────────────────────────────────────────

fn setup(
    env: &Env,
) -> (
    Address,           // contract_id
    FiatBridgeClient<'_>,
    Address,           // admin
    Address,           // token_addr
    StellarAssetClient<'_>,
) {
    let admin = Address::generate(env);
    let token_admin = Address::generate(env);
    let token_addr = env
        .register_stellar_asset_contract_v2(token_admin.clone())
        .address();
    let sac = StellarAssetClient::new(env, &token_addr);
    let contract_id = env.register(FiatBridge, ());
    let bridge = FiatBridgeClient::new(env, &contract_id);
    bridge.init(&admin, &token_addr, &Bytes::from_slice(env, b"ref"));
    bridge.set_limit(&token_addr, &1_000_000i128);
    (contract_id, bridge, admin, token_addr, sac)
}

/// Deposit `amount` for `user` and return; also mints the tokens first.
fn fund_and_deposit(
    bridge: &FiatBridgeClient<'_>,
    sac: &StellarAssetClient<'_>,
    user: &Address,
    token: &Address,
    amount: i128,
) {
    sac.mint(user, &amount);
    bridge.deposit(user, &amount, token, &Bytes::new(sac.env()), &0, &0, &None);
}
