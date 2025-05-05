use sudoku_variants_solver::puzzle::{self, Blocks, GivenNumbers, NonConsecutive, Puzzle};
use sudoku_variants_solver::solver;

fn run_bench(desc: &str, puzzle: Puzzle) {
    let start = std::time::Instant::now();
    let answer_default = solver::irrefutable_facts(&puzzle, false);
    let elapsed_default = start.elapsed();

    let start = std::time::Instant::now();
    let answer_opt = solver::irrefutable_facts(&puzzle, true);
    let elapsed_opt = start.elapsed();

    assert_eq!(answer_default, answer_opt);

    println!(
        "{:20} | {:8.2} | {:8.2}",
        desc,
        elapsed_default.as_secs_f64() * 1000.0,
        elapsed_opt.as_secs_f64() * 1000.0
    );
}

fn default_blocks(block_size: usize) -> Blocks {
    let size = block_size * block_size;
    let mut horizontal = vec![vec![false; size]; size - 1];
    let mut vertical = vec![vec![false; size - 1]; size];

    for y in 0..size {
        for x in 0..size {
            if y + 1 < size && (y + 1) % block_size == 0 {
                horizontal[y][x] = true;
            }
            if x + 1 < size && (x + 1) % block_size == 0 {
                vertical[y][x] = true;
            }
        }
    }

    Blocks {
        horizontal,
        vertical,
    }
}

fn given_numbers(data: &[[i32; 9]]) -> GivenNumbers {
    let mut ret = vec![vec![None; 9]; 9];
    for y in 0..9 {
        for x in 0..9 {
            if data[y][x] != 0 {
                ret[y][x] = Some(data[y][x]);
            }
        }
    }
    GivenNumbers { numbers: ret }
}

fn main() {
    run_bench(
        "no_clue",
        Puzzle {
            size: 9,
            blocks: Some(default_blocks(3)),
            given_numbers: puzzle::GivenNumbers {
                numbers: vec![vec![None; 9]; 9],
            },
            ..Default::default()
        },
    );

    run_bench(
        "no_clue_16x16",
        Puzzle {
            size: 16,
            blocks: Some(default_blocks(4)),
            given_numbers: puzzle::GivenNumbers {
                numbers: vec![vec![None; 16]; 16],
            },
            ..Default::default()
        },
    );

    run_bench(
        "few_clues",
        Puzzle {
            size: 9,
            blocks: Some(default_blocks(3)),
            given_numbers: given_numbers(&[
                [1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 2, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 5, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 6, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]),
            ..Default::default()
        },
    );

    run_bench(
        "few_answers",
        Puzzle {
            size: 9,
            blocks: Some(default_blocks(3)),
            given_numbers: given_numbers(&[
                [0, 0, 0, 1, 9, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 6, 0, 4, 0],
                [0, 2, 0, 0, 0, 0, 8, 0, 0],
                [1, 0, 0, 4, 0, 0, 0, 8, 0],
                [5, 0, 0, 0, 3, 0, 0, 0, 2],
                [0, 9, 0, 0, 0, 8, 0, 0, 3],
                [0, 0, 8, 0, 0, 0, 0, 2, 0],
                [0, 4, 0, 3, 0, 0, 6, 0, 0],
                [0, 0, 0, 0, 5, 1, 0, 0, 0],
            ]),
            ..Default::default()
        },
    );

    run_bench(
        "unique_answer",
        Puzzle {
            size: 9,
            blocks: Some(default_blocks(3)),
            given_numbers: given_numbers(&[
                [0, 0, 0, 1, 9, 0, 0, 0, 0],
                [0, 0, 3, 0, 0, 6, 0, 4, 0],
                [0, 2, 0, 0, 0, 0, 8, 0, 0],
                [1, 0, 0, 4, 0, 0, 0, 8, 0],
                [5, 0, 0, 0, 3, 0, 0, 0, 2],
                [0, 9, 0, 0, 0, 8, 0, 0, 3],
                [0, 0, 8, 0, 0, 0, 0, 2, 0],
                [0, 4, 0, 3, 0, 0, 6, 0, 0],
                [0, 0, 0, 0, 5, 1, 0, 0, 0],
            ]),
            ..Default::default()
        },
    );

    run_bench(
        "few_clues_noncon1",
        Puzzle {
            size: 9,
            blocks: Some(default_blocks(3)),
            given_numbers: given_numbers(&[
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 8, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]),
            non_consecutive: Some(NonConsecutive {}),
            ..Default::default()
        },
    );

    run_bench(
        "few_clues_noncon2",
        Puzzle {
            size: 9,
            blocks: Some(default_blocks(3)),
            given_numbers: given_numbers(&[
                [1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 6, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]),
            non_consecutive: Some(NonConsecutive {}),
            ..Default::default()
        },
    );
}
