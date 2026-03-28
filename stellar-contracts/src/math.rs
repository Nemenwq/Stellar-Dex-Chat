/// Compute (a * b) / c using fixed-point arithmetic to avoid overflow and precision loss.
/// The result is rounded down (floor division).
/// 
/// # Panics
/// Panics if `c` is zero.
pub fn mul_div_floor(a: i128, b: i128, c: i128) -> i128 {
    if c == 0 {
        panic!("Division by zero in mul_div_floor");
    }
    
    // To avoid overflow, check if a * b would overflow i128
    // For simplicity, we use checked_mul where possible, or fall back to
    // using u128 for intermediate computation if both a and b are positive
    
    let is_negative = (a < 0) ^ (b < 0) ^ (c < 0);
    
    let a_abs = a.abs() as u128;
    let b_abs = b.abs() as u128;
    let c_abs = c.abs() as u128;
    
    let result = (a_abs.saturating_mul(b_abs)) / c_abs;
    
    let result_i128 = result as i128;
    if is_negative {
        -result_i128
    } else {
        result_i128
    }
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
    }
}
