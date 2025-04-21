use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
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
}

#[derive(Debug, Clone, Deserialize)]
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

pub const ODDEVEN_NO_CONSTRAINT: i32 = 0;
pub const ODDEVEN_ODD: i32 = 1;
pub const ODDEVEN_EVEN: i32 = 2;
