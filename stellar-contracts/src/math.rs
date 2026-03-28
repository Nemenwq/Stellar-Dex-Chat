#![allow(dead_code)]

/// Fixed-point denominator used throughout the protocol.
pub const FIXED_POINT: i128 = 10_000_000;

/// Multiply `a` by `b`, then divide by `d`, rounding down (mathematical floor).
///
/// # Panics
/// Panics if `d` is zero or if `a * b` overflows `i128`.
pub fn mul_div_floor(a: i128, b: i128, d: i128) -> i128 {
    if d == 0 {
        panic!("division by zero in mul_div_floor");
    }

    let product = a
        .checked_mul(b)
        .unwrap_or_else(|| panic!("overflow in mul_div_floor"));

    let q = product / d;
    let r = product % d;

    // Rust division truncates toward zero. Adjust by -1 when signs differ and
    // there is a remainder to produce true floor semantics.
    if r != 0 && ((r > 0) != (d > 0)) {
        q - 1
    } else {
        q
    }
}

/// Scale `amount` by `(numerator / denominator)`, rounding down.
pub fn scale_floor(amount: i128, numerator: i128, denominator: i128) -> i128 {
    mul_div_floor(amount, numerator, denominator)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mul_div_floor_basic() {
        assert_eq!(mul_div_floor(10, 20, 4), 50);
        assert_eq!(mul_div_floor(100, 3, 10), 30);
    }

    #[test]
    fn test_mul_div_floor_with_negative() {
        assert_eq!(mul_div_floor(-10, 20, 4), -50);
        assert_eq!(mul_div_floor(10, -20, 4), -50);
        assert_eq!(mul_div_floor(-10, -20, 4), 50);
        assert_eq!(mul_div_floor(-1, 1, 2), -1);
        assert_eq!(mul_div_floor(1, -1, 2), -1);
    }

    #[test]
    fn test_scale_floor() {
        assert_eq!(scale_floor(1_000, 25, 100), 250);
    }
}
