use serde::Serialize;

use crate::puzzle::{
    Arrow, Blocks, Diagonal, GivenNumbers, Killer, NonConsecutive, OddEven, Puzzle, Thermo,
    ODDEVEN_EVEN, ODDEVEN_NO_CONSTRAINT, ODDEVEN_ODD, XV, XV_NO_CONSTRAINT, XV_V, XV_X,
};

use cspuz_rs::solver::{int_constant, IntVarArray2D, Solver};

#[derive(Debug, Clone, Serialize)]
pub struct IrrefutableFacts {
    #[serde(rename = "decidedNumbers")]
    pub decided_nums: Vec<Vec<Option<i32>>>,

    #[serde(rename = "candidates")]
    pub candidates: Vec<Vec<Vec<bool>>>,
}

pub fn irrefutable_facts(puzzle: &Puzzle) -> Option<IrrefutableFacts> {
    let n = puzzle.size;

    let mut solver = Solver::new();
    let nums = &solver.int_var_2d((n, n), 1, n as i32);
    solver.add_answer_key_int(nums);

    let mut indicators = vec![];
    for y in 0..n {
        let mut row = vec![];
        for x in 0..n {
            let v = solver.bool_var_1d(n);
            for i in 0..n {
                solver.add_expr(v.at(i).iff(nums.at((y, x)).eq(i as i32 + 1)));
            }
            solver.add_answer_key_bool(&v);
            row.push(v);
        }
        indicators.push(row);
    }

    add_constraints(&mut solver, nums, puzzle);

    let res = solver.irrefutable_facts()?;
    let decided_nums = res.get(nums);
    let mut candidates = vec![];
    for y in 0..n {
        let mut row = vec![];
        for x in 0..n {
            let mut cell = vec![];
            for i in 0..n {
                cell.push(res.get(&indicators[y][x].at(i)) != Some(false));
            }
            row.push(cell);
        }
        candidates.push(row);
    }

    Some(IrrefutableFacts {
        decided_nums,
        candidates,
    })
}

fn add_constraints(solver: &mut Solver, nums: &IntVarArray2D, puzzle: &Puzzle) {
    add_constraints_rows_columns(solver, nums);

    add_constraints_given_numbers(solver, nums, &puzzle.given_numbers);

    if let Some(blocks) = &puzzle.blocks {
        add_constraints_blocks(solver, nums, blocks);
    }

    if let Some(odd_even) = &puzzle.odd_even {
        add_constraints_odd_even(solver, nums, odd_even);
    }

    if let Some(non_consecutive) = &puzzle.non_consecutive {
        add_non_consecutive_constraints(solver, nums, non_consecutive);
    }

    if let Some(xv) = &puzzle.xv {
        add_xv_constraints(solver, nums, xv);
    }

    if let Some(diagonal) = &puzzle.diagonal {
        add_diagonal_constraints(solver, nums, diagonal);
    }

    if let Some(arrow_constraints) = &puzzle.arrow {
        add_arrow_constraints(solver, nums, arrow_constraints);
    }

    if let Some(thermo_constraints) = &puzzle.thermo {
        add_thermo_constraints(solver, nums, thermo_constraints);
    }

    if let Some(killer_constraints) = &puzzle.killer {
        add_killer_constraints(solver, nums, killer_constraints);
    }
}

fn add_complete_set(solver: &mut Solver, nums: &IntVarArray2D, cells: &[(usize, usize)]) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);
    assert_eq!(cells.len(), h);

    // TODO: some variants may use the number set other than {1, 2, ..., n}
    let cells = &nums.select(cells);
    solver.all_different(cells);

    for n in 1..=(h as i32) {
        solver.add_expr(cells.eq(n).count_true().eq(1));
    }
}

fn add_constraints_rows_columns(solver: &mut Solver, nums: &IntVarArray2D) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);

    for y in 0..h {
        let cells = (0..w).map(|x| (y, x)).collect::<Vec<_>>();
        add_complete_set(solver, nums, &cells);
    }

    for x in 0..w {
        let cells = (0..h).map(|y| (y, x)).collect::<Vec<_>>();
        add_complete_set(solver, nums, &cells);
    }
}

fn add_constraints_given_numbers(
    solver: &mut Solver,
    nums: &IntVarArray2D,
    given_numbers: &GivenNumbers,
) {
    let (h, w) = nums.shape();
    assert_eq!(given_numbers.numbers.len(), h);

    for y in 0..h {
        assert_eq!(given_numbers.numbers[y].len(), w);

        for x in 0..w {
            if let Some(n) = given_numbers.numbers[y][x] {
                solver.add_expr(nums.at((y, x)).eq(n));
            }
        }
    }
}

fn add_constraints_blocks(solver: &mut Solver, nums: &IntVarArray2D, blocks: &Blocks) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);
    let n = h;

    assert_eq!(blocks.horizontal.len(), n - 1);
    for y in 0..(n - 1) {
        assert_eq!(blocks.horizontal[y].len(), n);
    }

    assert_eq!(blocks.vertical.len(), n);
    for x in 0..n {
        assert_eq!(blocks.vertical[x].len(), n - 1);
    }

    let mut visited = vec![vec![false; n]; n];
    for y in 0..n {
        for x in 0..n {
            if visited[y][x] {
                continue;
            }

            let mut cells = vec![];
            let mut queue = vec![(y, x)];

            while let Some((y, x)) = queue.pop() {
                if visited[y][x] {
                    continue;
                }
                visited[y][x] = true;
                cells.push((y, x));

                if y < n - 1 && !blocks.horizontal[y][x] {
                    queue.push((y + 1, x));
                }
                if x < n - 1 && !blocks.vertical[y][x] {
                    queue.push((y, x + 1));
                }
                if y > 0 && !blocks.horizontal[y - 1][x] {
                    queue.push((y - 1, x));
                }
                if x > 0 && !blocks.vertical[y][x - 1] {
                    queue.push((y, x - 1));
                }
            }

            if cells.len() == n {
                add_complete_set(solver, nums, &cells);
            }
        }
    }
}

fn add_constraints_odd_even(solver: &mut Solver, nums: &IntVarArray2D, odd_even: &OddEven) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);
    assert_eq!(odd_even.cell_kind.len(), h);

    for y in 0..h {
        assert_eq!(odd_even.cell_kind[y].len(), w);

        for x in 0..w {
            let kind = odd_even.cell_kind[y][x];
            if kind == ODDEVEN_NO_CONSTRAINT {
                continue;
            }

            for n in 1..=(h as i32) {
                if kind == ODDEVEN_ODD && !(n % 2 == 1) {
                    solver.add_expr(nums.at((y, x)).ne(n));
                }
                if kind == ODDEVEN_EVEN && !(n % 2 == 0) {
                    solver.add_expr(nums.at((y, x)).ne(n));
                }
            }
        }
    }
}

fn add_non_consecutive_constraints(
    solver: &mut Solver,
    nums: &IntVarArray2D,
    non_consecutive: &NonConsecutive,
) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);

    for y in 0..h {
        for x in 0..w {
            let a = nums.at((y, x));
            if x > 0 {
                let b = &nums.at((y, x - 1));
                solver.add_expr(a.ne(b - 1));
                solver.add_expr(a.ne(b + 1));
            }

            if y > 0 {
                let b = &nums.at((y - 1, x));
                solver.add_expr(a.ne(b - 1));
                solver.add_expr(a.ne(b + 1));
            }
        }
    }
}

fn add_xv_constraints(solver: &mut Solver, nums: &IntVarArray2D, xv: &XV) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);

    assert_eq!(xv.horizontal.len(), h - 1);
    for y in 0..(h - 1) {
        assert_eq!(xv.horizontal[y].len(), w);

        for x in 0..w {
            let kind = xv.horizontal[y][x];

            match kind {
                XV_NO_CONSTRAINT => {
                    solver.add_expr((nums.at((y, x)) + nums.at((y + 1, x))).ne(10));
                    solver.add_expr((nums.at((y, x)) + nums.at((y + 1, x))).ne(5));
                }
                XV_X => solver.add_expr((nums.at((y, x)) + nums.at((y + 1, x))).eq(10)),
                XV_V => solver.add_expr((nums.at((y, x)) + nums.at((y + 1, x))).eq(5)),
                _ => panic!(),
            }
        }
    }

    assert_eq!(xv.vertical.len(), h);
    for y in 0..h {
        assert_eq!(xv.vertical[y].len(), w - 1);

        for x in 0..(w - 1) {
            let kind = xv.vertical[y][x];

            match kind {
                XV_NO_CONSTRAINT => {
                    if xv.all_shown {
                        solver.add_expr((nums.at((y, x)) + nums.at((y, x + 1))).ne(10));
                    }
                }
                XV_X => solver.add_expr((nums.at((y, x)) + nums.at((y, x + 1))).eq(10)),
                XV_V => solver.add_expr((nums.at((y, x)) + nums.at((y, x + 1))).eq(5)),
                _ => panic!(),
            }
        }
    }
}

fn add_diagonal_constraints(solver: &mut Solver, nums: &IntVarArray2D, diagonal: &Diagonal) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);

    if diagonal.main_diagonal {
        add_complete_set(solver, nums, &(0..h).map(|i| (i, i)).collect::<Vec<_>>());
    }

    if diagonal.anti_diagonal {
        add_complete_set(
            solver,
            nums,
            &(0..h).map(|i| (i, h - 1 - i)).collect::<Vec<_>>(),
        );
    }
}

fn add_arrow_constraints(solver: &mut Solver, nums: &IntVarArray2D, arrow_constraints: &Arrow) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);

    for arrow in &arrow_constraints.arrows {
        assert!(arrow.len() >= 1);

        let mut non_head_sum = int_constant(0);
        for i in 1..arrow.len() {
            non_head_sum = non_head_sum + nums.at((arrow[i].y, arrow[i].x));
        }

        solver.add_expr(nums.at((arrow[0].y, arrow[0].x)).eq(non_head_sum));
    }
}

fn add_thermo_constraints(solver: &mut Solver, nums: &IntVarArray2D, thermo_constraints: &Thermo) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);

    for thermo in &thermo_constraints.thermos {
        for i in 1..thermo.len() {
            solver.add_expr(
                nums.at((thermo[i].y, thermo[i].x))
                    .gt(nums.at((thermo[i - 1].y, thermo[i - 1].x))),
            );
        }
    }
}

fn add_killer_constraints(solver: &mut Solver, nums: &IntVarArray2D, killer_constraints: &Killer) {
    let (h, w) = nums.shape();
    assert_eq!(h, w);

    for region in &killer_constraints.regions {
        let mut sum = int_constant(0);
        for cell in &region.cells {
            sum = sum + nums.at((cell.y, cell.x));
        }

        if let Some(sum_value) = region.sum {
            solver.add_expr(sum.eq(sum_value));
        }

        if killer_constraints.distinct {
            let mut cells = vec![];
            for cell in &region.cells {
                cells.push(nums.at((cell.y, cell.x)));
            }
            solver.all_different(cells);
        }
    }
}
