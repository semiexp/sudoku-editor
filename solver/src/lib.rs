pub mod puzzle;
pub mod solver;

static mut SHARED_ARRAY: Vec<u8> = Vec::new();

#[no_mangle]
fn solve_problem(puzzle_json: *const u8, len: usize) -> *const u8 {
    let puzzle_json = unsafe { std::slice::from_raw_parts(puzzle_json, len) };
    let puzzle: puzzle::Puzzle = serde_json::from_slice(puzzle_json).unwrap(); // TODO: handle error

    let answer = solver::irrefutable_facts(&puzzle, true);
    let answer_str = serde_json::to_string(&answer).unwrap(); // TODO: handle error

    unsafe {
        let answer_len = answer_str.len();

        SHARED_ARRAY.clear();
        SHARED_ARRAY.push((answer_len & 0xFF) as u8);
        SHARED_ARRAY.push(((answer_len >> 8) & 0xFF) as u8);
        SHARED_ARRAY.push(((answer_len >> 16) & 0xFF) as u8);
        SHARED_ARRAY.push(((answer_len >> 24) & 0xFF) as u8);
        SHARED_ARRAY.extend(answer_str.as_bytes());
        SHARED_ARRAY.as_ptr()
    }
}
