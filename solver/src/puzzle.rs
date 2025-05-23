use serde::Deserialize;

#[derive(Debug, Clone, Deserialize, Default)]
pub struct Puzzle {
    pub size: usize,

    #[serde(rename = "givenNumbers")]
    pub given_numbers: GivenNumbers,

    #[serde(rename = "blocks")]
    pub blocks: Option<Blocks>,

    #[serde(rename = "oddEven")]
    pub odd_even: Option<OddEven>,

    #[serde(rename = "nonConsecutive")]
    pub non_consecutive: Option<NonConsecutive>,

    #[serde(rename = "xv")]
    pub xv: Option<XV>,

    #[serde(rename = "diagonal")]
    pub diagonal: Option<Diagonal>,

    #[serde(rename = "arrow")]
    pub arrow: Option<Arrow>,

    #[serde(rename = "thermo")]
    pub thermo: Option<Thermo>,

    #[serde(rename = "killer")]
    pub killer: Option<Killer>,

    #[serde(rename = "consecutive")]
    pub consecutive: Option<Consecutive>,

    #[serde(rename = "skyscrapers")]
    pub skyscrapers: Option<Skyscrapers>,

    #[serde(rename = "xSums")]
    pub x_sums: Option<XSums>,

    #[serde(rename = "extraRegions")]
    pub extra_regions: Option<ExtraRegions>,

    #[serde(rename = "palindrome")]
    pub palindrome: Option<Palindrome>,

    #[serde(rename = "forbiddenCandidates")]
    pub forbidden_candidates: Option<ForbiddenCandidates>,

    #[serde(rename = "antiKnight")]
    pub anti_knight: Option<AntiKnight>,

    #[serde(rename = "noTouch")]
    pub no_touch: Option<NoTouch>,
}

#[derive(Debug, Clone, Deserialize, Default)]
pub struct GivenNumbers {
    pub numbers: Vec<Vec<Option<i32>>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Blocks {
    #[serde(rename = "horizontalBorder")]
    pub horizontal: Vec<Vec<bool>>,

    #[serde(rename = "verticalBorder")]
    pub vertical: Vec<Vec<bool>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct OddEven {
    #[serde(rename = "cellKind")]
    pub cell_kind: Vec<Vec<i32>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct NonConsecutive {}

#[derive(Debug, Clone, Deserialize)]
pub struct XV {
    #[serde(rename = "horizontalBorder")]
    pub horizontal: Vec<Vec<i32>>,

    #[serde(rename = "verticalBorder")]
    pub vertical: Vec<Vec<i32>>,

    #[serde(rename = "allShown")]
    pub all_shown: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Diagonal {
    #[serde(rename = "mainDiagonal")]
    pub main_diagonal: bool,

    #[serde(rename = "antiDiagonal")]
    pub anti_diagonal: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Pos {
    pub x: usize,
    pub y: usize,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Arrow {
    pub arrows: Vec<Vec<Pos>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Thermo {
    pub thermos: Vec<Vec<Pos>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct KillerRegion {
    pub cells: Vec<Pos>,

    #[serde(rename = "extraValue")]
    pub sum: Option<i32>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Killer {
    pub regions: Vec<KillerRegion>,
    pub distinct: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Consecutive {
    #[serde(rename = "horizontalBorder")]
    pub horizontal: Vec<Vec<bool>>,

    #[serde(rename = "verticalBorder")]
    pub vertical: Vec<Vec<bool>>,

    #[serde(rename = "allShown")]
    pub all_shown: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Skyscrapers {
    pub up: Vec<Option<i32>>,
    pub down: Vec<Option<i32>>,
    pub left: Vec<Option<i32>>,
    pub right: Vec<Option<i32>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct XSums {
    pub up: Vec<Option<i32>>,
    pub down: Vec<Option<i32>>,
    pub left: Vec<Option<i32>>,
    pub right: Vec<Option<i32>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ExtraRegion {
    pub cells: Vec<Pos>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ExtraRegions {
    pub regions: Vec<ExtraRegion>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Palindrome {
    pub palindromes: Vec<Vec<Pos>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ForbiddenCandidates {
    #[serde(rename = "isForbidden")]
    pub is_forbidden: Vec<Vec<Vec<bool>>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AntiKnight {}

#[derive(Debug, Clone, Deserialize)]
pub struct NoTouch {}

pub const ODDEVEN_NO_CONSTRAINT: i32 = 0;
pub const ODDEVEN_ODD: i32 = 1;
pub const ODDEVEN_EVEN: i32 = 2;

pub const XV_NO_CONSTRAINT: i32 = 0;
pub const XV_X: i32 = 1;
pub const XV_V: i32 = 2;
