use sudoku_variants_solver::puzzle::{
    self, Arrow, Blocks, GivenNumbers, NonConsecutive, Pos, Puzzle, Skyscrapers, Thermo,
};
use sudoku_variants_solver::solver::{irrefutable_facts, SolverConfig};

const CONFIGS: [(&'static str, SolverConfig); 3] = [
    (
        "default",
        SolverConfig {
            optimize_polarity: false,
            explicit_set_encoding: false,
        },
    ),
    (
        "opt",
        SolverConfig {
            optimize_polarity: true,
            explicit_set_encoding: false,
        },
    ),
    (
        "expl_set",
        SolverConfig {
            optimize_polarity: true,
            explicit_set_encoding: true,
        },
    ),
];

fn show_header() {
    print!("| {:25}", "Instance");
    for (name, _) in CONFIGS.iter() {
        print!(" | {:8}", name);
    }
    println!(" |");
}

fn run_bench(desc: &str, puzzle: Puzzle) {
    let mut expected_answer = None;

    print!("| {:25}", desc);
    for (_, config) in CONFIGS.iter() {
        let start = std::time::Instant::now();
        let answer = irrefutable_facts(&puzzle, *config);

        if let Some(expected) = &expected_answer {
            assert_eq!(&answer, expected);
        } else {
            expected_answer = Some(answer);
        }

        let elapsed = start.elapsed();

        print!(" | {:8.2}", elapsed.as_secs_f64() * 1000.0);
    }
    println!(" |");
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
    let args: Vec<String> = std::env::args().collect();
    let full = args.iter().any(|arg| arg == "--full");

    show_header();

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
        "few_clues_arrow",
        Puzzle {
            size: 9,
            blocks: Some(default_blocks(3)),
            given_numbers: given_numbers(&[
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 2, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 4, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 8, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 6, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]),
            arrow: Some(Arrow {
                arrows: vec![vec![
                    Pos { x: 3, y: 5 },
                    Pos { x: 4, y: 5 },
                    Pos { x: 5, y: 6 },
                    Pos { x: 6, y: 7 },
                ]],
            }),
            ..Default::default()
        },
    );

    run_bench(
        "few_clues_thermo",
        Puzzle {
            size: 9,
            blocks: Some(default_blocks(3)),
            given_numbers: given_numbers(&[
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 2, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 4, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 8, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 6, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]),
            thermo: Some(Thermo {
                thermos: vec![vec![
                    Pos { x: 3, y: 5 },
                    Pos { x: 4, y: 5 },
                    Pos { x: 5, y: 6 },
                    Pos { x: 6, y: 7 },
                ]],
            }),
            ..Default::default()
        },
    );

    run_bench(
        "few_clues_skyscrapers",
        Puzzle {
            size: 9,
            blocks: Some(default_blocks(3)),
            given_numbers: given_numbers(&[
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 5, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 6, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]),
            skyscrapers: Some(Skyscrapers {
                up: vec![None, None, None, None, None, None, None, Some(6), None],
                down: vec![None, None, None, None, None, None, None, None, None],
                left: vec![None, None, None, Some(5), None, None, None, None, None],
                right: vec![None, None, None, None, None, Some(3), None, None, None],
            }),
            ..Default::default()
        },
    );

    if full {
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
}
