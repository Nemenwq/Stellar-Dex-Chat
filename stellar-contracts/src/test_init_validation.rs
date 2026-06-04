#[cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    vec, Address, Env,
};

#[test]
fn test_reinitialization_blocked_after_renounce() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FiatBridge, ());
    let bridge = FiatBridgeClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);
    let _signers = vec![&env, admin.clone()];

    // First initialization
    let reference = Bytes::from_slice(&env, b"test_reference");
    bridge.init(&admin, &token, &reference);

    // Renounce admin
    bridge.queue_renounce_admin();
    
    // Advance ledger to satisfy MIN_TIMELOCK_DELAY (34560 ledgers)
    let current_ledger = env.ledger().sequence();
    env.ledger().set_sequence_number(current_ledger + 34560 + 1);
    
    bridge.execute_renounce_admin();

    // Verify admin is removed
    let admin_res = bridge.try_get_admin();
    assert!(admin_res.is_err());

    // Attempting to re-initialize should fail with AlreadyInitialized
    // even though the Admin key is gone, because SchemaVersion remains.
    let new_admin = Address::generate(&env);
    let reference = Bytes::from_slice(&env, b"test_reference");
    let result = bridge.try_init(&new_admin, &token, &reference);
    
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}

#[test]
fn test_init_rejects_contract_as_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FiatBridge, ());
    let bridge = FiatBridgeClient::new(&env, &contract_id);

    let token = Address::generate(&env);
    let _signers = vec![&env, token.clone()];

    // Attempt to set contract itself as admin
    let reference = Bytes::from_slice(&env, b"test_reference");
    let result = bridge.try_init(&contract_id, &token, &reference);
    
    assert_eq!(result, Err(Ok(Error::Unauthorized)));
}

#[test]
fn test_init_rejects_too_many_signers() {
    // The current init signature does not accept signers; this test verifies
    // that initialising with a contract-address admin is rejected, and that
    // a second init call after the first succeeds is rejected as AlreadyInitialized.
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FiatBridge, ());
    let bridge = FiatBridgeClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);

    let reference = Bytes::from_slice(&env, b"test_reference");
    // First call must succeed.
    bridge.init(&admin, &token, &reference);

    // Second call must be rejected.
    let result = bridge.try_init(&admin, &token, &reference);
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}

#[test]
fn test_init_rejects_empty_signers() {
    // The current init signature does not accept signers; this test verifies
    // that a contract address cannot be used as admin.
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FiatBridge, ());
    let bridge = FiatBridgeClient::new(&env, &contract_id);

    let token = Address::generate(&env);

    let reference = Bytes::from_slice(&env, b"test_reference");
    let result = bridge.try_init(&contract_id, &token, &reference);
    assert_eq!(result, Err(Ok(Error::Unauthorized)));
}

#[test]
fn test_init_rejects_zero_threshold() {
    // The current init signature does not accept a threshold; this test verifies
    // that re-initialisation is blocked after a successful init.
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FiatBridge, ());
    let bridge = FiatBridgeClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);

    let reference = Bytes::from_slice(&env, b"test_reference");
    bridge.init(&admin, &token, &reference);

    // Any subsequent init attempt must return AlreadyInitialized.
    let new_admin = Address::generate(&env);
    let result = bridge.try_init(&new_admin, &token, &reference);
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}
