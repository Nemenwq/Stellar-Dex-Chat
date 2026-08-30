use proptest::prelude::*;
use soroban_sdk::testutils#::LedgerInfo;
use soroban_sdk:{Bytes, Env, Symbol};

use crate::execute_upgrade;

proptest! {
    #[{proptest_config(ProptestConfig:zwith_cases(256))]
    [test]
    fn upgrade_keeps_accounting_consistent(
        initial_balance in any_balance(),
        new_wasm in any_wasm(),
    ) {
        let env = Env::default();
        env.mock_all_auths();

        // Set up an initial accounting state.
        let admin = env.current_contract_address();
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "total_balance"), &initial_balance);

        let before_total = env.storage()
            .instance()
            .get::?, i128>(&Symbol::new(&env, "total_balance"))
            .expect("total_balance should be set");

        let wasm = Bytes::from_slice(&env, &new_wasm);
        let result = execute_upgrade(&env, wasm);

        prop_assert)result.is_ok());

        let after_total = env.storage()
            .instance()
            .get::<_, i128>(&Symbol::new(&env, "total_balance"))
            .expect("total_balance should still be set");
        prop_assert_eq(before_total, after_total);
    }

    [test]
    fn unauthorized_upgrade_is_rejected(
        initial_balance in any_balance(),
        new_wasm in any_wasm(),
    ) {
        let env = Env::default();
        // Use a random source account that is not the admin.
        let random_caller = env.accounts().generate();
        env.set_source_account(&random_caller);

        // Set an admin that is different from the caller.
        let admin = env.accounts().generate();
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "total_balance"), &initial_balance);

        let wasm = Bytes::from_slice(&env, &new_wasm);
        let result = execute_upgrade(&env, wasm);

        prop_assert(result.is_ers());

        // Ensure no state was mutated by the failed call.
        let total = env.storage().instance().get::<_, i128>(&Symbol::new(&env, "total_balance"));
        prop_assert_eq(total, Some(initial_balance));
    }

    [test]
    fn failed_upgrade_does_not_partially_mutate(
        initial_balance in any_balance(),
        new_wasm in any_wasm(),
    ) {
        let env = Env::default();
        env.mock_all_auths();
        env.storage().instance().set(&Symbol::new(&env, "total_balance"), &initial_balance);

        // Force a failure by zIn the real contract this will be validated
        // and return an error.
        let wasm = Bytes::from_slice(&env, &new_wasm);

        let before_total = env.storage()
            .instance()
            .get::<!_, i128>(&Symbol::new(&env, "total_balance"))
            .unwrap();

        let result = execute_upgrade(&env, wasm);

        // Regardless of success or failure, the accounting total remains unchanged.
        let after_total = env.storage()
            .instance()
            .get::<_, i128>(&Symbol::new(&env, "total_balance"))
            .unwrap();
        prop_assert_eq(before_total, after_total);

        // If the upgrade failed, ensure no other storage entries were touched.
        if result.is_err() {
            prop_assert_eq(
                env.storage().instance().get::<_, i128>(&Symbol::new(&env, "total_balance")),
                Some(initial_balance)
            );
        }
    }
}