#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env};

// ── Error codes ───────────────────────────────────────────────────────────
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    ZeroAmount = 4,
    ExceedsLimit = 5,
    InsufficientFunds = 6,
    WithdrawalLocked = 7,
    RequestNotFound = 8,
    DailyLimitExceeded = 9,
}

// ── Models ────────────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WithdrawRequest {
    pub to: Address,
    pub amount: i128,
    pub unlock_ledger: u32,
}

// ── Storage keys ──────────────────────────────────────────────────────────
#[contracttype]
pub enum DataKey {
    Admin,
    Token,
    BridgeLimit,
    TotalDeposited,
    LockPeriod,
    WithdrawQueue(u64),
    NextRequestID,
    FeeBps,
    FeeAccrued,
    DailyWithdrawLimit,
    WindowStart,
    WindowWithdrawn,
}

/// Approximate number of ledgers in a 24-hour window (5-second close time).
const WINDOW_LEDGERS: u32 = 17_280;

// ── Contract ──────────────────────────────────────────────────────────────
#[contract]
pub struct FiatBridge;

#[contractimpl]
impl FiatBridge {
    /// Initialise the bridge once. Sets admin, token address and per-deposit limit.
    pub fn init(env: Env, admin: Address, token: Address, limit: i128) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        if limit <= 0 {
            return Err(Error::ZeroAmount);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::BridgeLimit, &limit);
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposited, &0_i128);
        Ok(())
    }

    /// Lock tokens inside the bridge. Caller must authorise.
    pub fn deposit(env: Env, from: Address, amount: i128) -> Result<(), Error> {
        from.require_auth();
        if amount <= 0 {
            return Err(Error::ZeroAmount);
        }
        let limit: i128 = env
            .storage()
            .instance()
            .get(&DataKey::BridgeLimit)
            .ok_or(Error::NotInitialized)?;
        if amount > limit {
            return Err(Error::ExceedsLimit);
        }
        let fee_bps: u32 = env.storage().instance()
            .get(&DataKey::FeeBps).unwrap_or(0);
        let fee: i128 = (amount * fee_bps as i128) / 10_000;
        let net: i128 = amount - fee;
        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(Error::NotInitialized)?;
        token::Client::new(&env, &token_id).transfer(
            &from,
            &env.current_contract_address(),
            &net,
        );
        if fee > 0 {
            let accrued: i128 = env
                .storage()
                .instance()
                .get(&DataKey::FeeAccrued)
                .unwrap_or(0);
            env.storage()
                .instance()
                .set(&DataKey::FeeAccrued, &(accrued + fee));
            env.events().publish(("fee_collected",), fee);
        }
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposited)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposited, &(total + net));
        Ok(())
    }

    /// Register a withdrawal request that matures after the lock period. Admin only.
    pub fn request_withdrawal(env: Env, to: Address, amount: i128) -> Result<u64, Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(Error::ZeroAmount);
        }

        let lock_period: u32 = env.storage().instance().get(&DataKey::LockPeriod).unwrap_or(0);
        let unlock_ledger = env.ledger().sequence() + lock_period;

        let request_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextRequestID)
            .unwrap_or(0);

        let request = WithdrawRequest {
            to,
            amount,
            unlock_ledger,
        };

        env.storage()
            .persistent()
            .set(&DataKey::WithdrawQueue(request_id), &request);
        env.storage()
            .instance()
            .set(&DataKey::NextRequestID, &(request_id + 1));

        Ok(request_id)
    }

    /// Execute a matured withdrawal request.
    pub fn execute_withdrawal(env: Env, request_id: u64) -> Result<(), Error> {
        let request: WithdrawRequest = env
            .storage()
            .persistent()
            .get(&DataKey::WithdrawQueue(request_id))
            .ok_or(Error::RequestNotFound)?;

        if env.ledger().sequence() < request.unlock_ledger {
            return Err(Error::WithdrawalLocked);
        }

        // ── Rolling daily withdrawal limit check ──────────────────────────
        let daily_limit: i128 = env
            .storage()
            .instance()
            .get(&DataKey::DailyWithdrawLimit)
            .unwrap_or(0);
        let new_window_withdrawn: Option<i128> = if daily_limit > 0 {
            let current_seq = env.ledger().sequence();
            // Persist WindowStart on first use so future resets can be detected.
            let window_start: u32 = env
                .storage()
                .instance()
                .get(&DataKey::WindowStart)
                .unwrap_or_else(|| {
                    env.storage()
                        .instance()
                        .set(&DataKey::WindowStart, &current_seq);
                    current_seq
                });
            let window_withdrawn: i128 = if current_seq >= window_start + WINDOW_LEDGERS {
                // Window has expired — start a fresh one.
                env.storage()
                    .instance()
                    .set(&DataKey::WindowStart, &current_seq);
                env.storage()
                    .instance()
                    .set(&DataKey::WindowWithdrawn, &0_i128);
                0
            } else {
                env.storage()
                    .instance()
                    .get(&DataKey::WindowWithdrawn)
                    .unwrap_or(0)
            };
            if window_withdrawn + request.amount > daily_limit {
                return Err(Error::DailyLimitExceeded);
            }
            Some(window_withdrawn + request.amount)
        } else {
            None
        };

        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(Error::NotInitialized)?;
        let token_client = token::Client::new(&env, &token_id);

        let balance = token_client.balance(&env.current_contract_address());
        if request.amount > balance {
            return Err(Error::InsufficientFunds);
        }

        token_client.transfer(&env.current_contract_address(), &request.to, &request.amount);

        // Persist the updated window total after a successful transfer.
        if let Some(new_total) = new_window_withdrawn {
            env.storage()
                .instance()
                .set(&DataKey::WindowWithdrawn, &new_total);
        }

        env.storage()
            .persistent()
            .remove(&DataKey::WithdrawQueue(request_id));

        Ok(())
    }

    /// Cancel a pending withdrawal request. Admin only.
    pub fn cancel_withdrawal(env: Env, request_id: u64) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if !env
            .storage()
            .persistent()
            .has(&DataKey::WithdrawQueue(request_id))
        {
            return Err(Error::RequestNotFound);
        }

        env.storage()
            .persistent()
            .remove(&DataKey::WithdrawQueue(request_id));
        Ok(())
    }

    /// Set the mandatory delay period for withdrawals (in ledgers). Admin only.
    pub fn set_lock_period(env: Env, ledgers: u32) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::LockPeriod, &ledgers);
        Ok(())
    }

    /// Set the maximum tokens that may be withdrawn within a rolling 24-hour window
    /// (~17 280 ledgers). Setting to 0 disables the daily cap. Admin only.
    pub fn set_daily_limit(env: Env, limit: i128) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();
        if limit < 0 {
            return Err(Error::ZeroAmount);
        }
        env.storage()
            .instance()
            .set(&DataKey::DailyWithdrawLimit, &limit);
        Ok(())
    }

    /// Update the per-deposit limit. Admin only.
    pub fn set_limit(env: Env, new_limit: i128) -> Result<(), Error> {
        if new_limit <= 0 {
            return Err(Error::ZeroAmount);
        }
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::BridgeLimit, &new_limit);
        Ok(())
    }

    /// Hand admin rights to a new address. Current admin must authorise.
    pub fn transfer_admin(env: Env, new_admin: Address) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        Ok(())
    }

    /// Set the protocol fee in basis points (max 1000 = 10%). Admin only.
    pub fn set_fee(env: Env, bps: u32) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();
        if bps > 1000 {
            return Err(Error::ExceedsLimit);
        }
        env.storage().instance().set(&DataKey::FeeBps, &bps);
        Ok(())
    }

    /// Transfer all accrued fees to recipient. Admin only.
    pub fn sweep_fees(env: Env, recipient: Address) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();
        let accrued: i128 = env
            .storage()
            .instance()
            .get(&DataKey::FeeAccrued)
            .unwrap_or(0);
        if accrued == 0 {
            return Err(Error::ZeroAmount);
        }
        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(Error::NotInitialized)?;
        token::Client::new(&env, &token_id).transfer(
            &env.current_contract_address(),
            &recipient,
            &accrued,
        );
        env.storage().instance().set(&DataKey::FeeAccrued, &0_i128);
        Ok(())
    }

    // ── View functions ────────────────────────────────────────────────────
    pub fn get_admin(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)
    }
    pub fn get_token(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(Error::NotInitialized)
    }
    pub fn get_limit(env: Env) -> Result<i128, Error> {
        env.storage()
            .instance()
            .get(&DataKey::BridgeLimit)
            .ok_or(Error::NotInitialized)
    }
    /// Current token balance held by this contract.
    pub fn get_balance(env: Env) -> Result<i128, Error> {
        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(Error::NotInitialized)?;
        Ok(token::Client::new(&env, &token_id).balance(&env.current_contract_address()))
    }
    /// Running total of all historical deposits (never decremented).
    pub fn get_total_deposited(env: Env) -> Result<i128, Error> {
        env.storage()
            .instance()
            .get(&DataKey::TotalDeposited)
            .ok_or(Error::NotInitialized)
    }
    /// Get details of a withdrawal request.
    pub fn get_withdrawal_request(env: Env, request_id: u64) -> Option<WithdrawRequest> {
        env.storage()
            .persistent()
            .get(&DataKey::WithdrawQueue(request_id))
    }
    /// Get the current lock period in ledgers.
    pub fn get_lock_period(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::LockPeriod).unwrap_or(0)
    }
    /// Get the current fee rate in basis points.
    pub fn get_fee_bps(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::FeeBps).unwrap_or(0)
    }
    /// Get the total fees accrued so far.
    pub fn get_fee_accrued(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::FeeAccrued).unwrap_or(0)
    }
    /// Get the configured daily withdrawal limit (0 = unlimited).
    pub fn get_daily_limit(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::DailyWithdrawLimit)
            .unwrap_or(0)
    }
    /// Get the total tokens already withdrawn within the current window.
    pub fn get_window_withdrawn(env: Env) -> i128 {
        let current_seq = env.ledger().sequence();
        let window_start: u32 = env
            .storage()
            .instance()
            .get(&DataKey::WindowStart)
            .unwrap_or(current_seq);
        if current_seq >= window_start + WINDOW_LEDGERS {
            0
        } else {
            env.storage()
                .instance()
                .get(&DataKey::WindowWithdrawn)
                .unwrap_or(0)
        }
    }
    /// Get the tokens still available for withdrawal in the current window.
    /// Returns i128::MAX when the daily limit is disabled (0).
    pub fn get_window_remaining(env: Env) -> i128 {
        let daily_limit: i128 = env
            .storage()
            .instance()
            .get(&DataKey::DailyWithdrawLimit)
            .unwrap_or(0);
        if daily_limit == 0 {
            return i128::MAX;
        }
        let withdrawn = Self::get_window_withdrawn(env);
        (daily_limit - withdrawn).max(0)
    }
}

mod test;
