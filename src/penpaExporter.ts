import { deflateBase64 } from "./zlib";
import { Problem } from "./puzzle";
import { allRules } from "./rules/rules";

export type Cell = { y: number; x: number };
export type Edge = {
  y: number;
  x: number;
  direction: "horizontal" | "vertical";
};
export type Item =
  | {
      kind: "text";
      position: Cell | Edge;
      value: string;
      color: number;
      style: string;
    }
  | {
      kind: "symbol";
      position: Cell | Edge;
      color: number;
      symbolName: string;
      isFront: boolean;
    }
  | { kind: "edge"; position: Edge; style: number }
  | {
      kind: "line";
      position1: Cell | Edge;
      position2: Cell | Edge;
      style: number;
    }
  | { kind: "diagonal"; direction: "main" | "anti" }
  | { kind: "arrow"; cells: Cell[] }
  | { kind: "thermo"; cells: Cell[] };
export type BoardData = {
  items: Item[];
  margin: number;
};

const positionId = (
  boardSize: number,
  margin: number,
  position: Cell | Edge,
): number => {
  const n = boardSize + margin * 2;
  const coord = (position.y + margin) * (n + 4) + (position.x + margin);
  if ("direction" in position) {
    if (position.direction === "horizontal") {
      return 2 * n * n + 18 * n + 42 + coord;
    } else {
      return 3 * n * n + 26 * n + 58 + coord;
    }
  } else {
    return 2 * n + 10 + coord;
  }
};

const vertexId = (
  boardSize: number,
  margin: number,
  position: { y: number; x: number },
): number => {
  const n = boardSize + margin * 2;
  const y = position.y + margin;
  const x = position.x + margin;

  return n * n + 9 * n + 21 + y * (n + 4) + x;
};

const headerLine = (n: number): string => {
  const cellSize = 38;
  const pixelCount = cellSize * (n + 1);
  const magic =
    n % 2 === 0 ? 1.5 * n * n + 11.5 * n + 21 : 0.5 * n * n + 4 * n + 7.5;
  return `square,${n},${n},${cellSize},0,1,1,${pixelCount},${pixelCount},${magic},${magic},0,0,0,0,Title: ,Author: ,,,OFF,false`;
};

const marginLine = (margin: number): string => {
  return JSON.stringify([margin, margin, margin, margin]);
};

const cellsLine = (boardSize: number, margin: number): string => {
  let lastId = 0;
  let res = [];
  for (let y = 0; y < boardSize; ++y) {
    for (let x = 0; x < boardSize; ++x) {
      let curId = positionId(boardSize, margin, { y, x });
      res.push(curId - lastId);
      lastId = curId;
    }
  }

  return JSON.stringify(res);
};

const itemsLine = (
  boardSize: number,
  margin: number,
  items: Item[],
): string => {
  let texts: Record<string, any> = {};
  let symbols: Record<string, any> = {};
  let edges: Record<string, any> = {};
  let lines: Record<string, any> = {};
  let arrows: number[][] = [];
  let thermos: number[][] = [];

  for (const item of items) {
    if (item.kind === "text") {
      const idx = positionId(boardSize, margin, item.position);
      texts[idx.toString()] = [item.value, item.color, item.style];
    } else if (item.kind === "symbol") {
      const idx = positionId(boardSize, margin, item.position);
      symbols[idx.toString()] = [
        item.color,
        item.symbolName,
        item.isFront ? 2 : 1,
      ];
    } else if (item.kind === "edge") {
      const dy1 = item.position.direction === "horizontal" ? 1 : 0;
      const dx1 = item.position.direction === "horizontal" ? 0 : 1;
      const idx1 = vertexId(boardSize, margin, {
        y: item.position.y + dy1,
        x: item.position.x + dx1,
      });
      const idx2 = vertexId(boardSize, margin, {
        y: item.position.y + 1,
        x: item.position.x + 1,
      });
      edges[`${idx1},${idx2}`] = item.style;
    } else if (item.kind === "line") {
      const idx1 = positionId(boardSize, margin, item.position1);
      const idx2 = positionId(boardSize, margin, item.position2);

      if (idx1 < idx2) {
        lines[`${idx1},${idx2}`] = item.style;
      } else {
        lines[`${idx2},${idx1}`] = item.style;
      }
    } else if (item.kind === "diagonal") {
      if (item.direction === "main") {
        for (let i = 0; i < boardSize; ++i) {
          const idx1 = vertexId(boardSize, margin, { y: i, x: i });
          const idx2 = vertexId(boardSize, margin, { y: i + 1, x: i + 1 });
          edges[`${idx1},${idx2}`] = 12;
        }
      } else {
        for (let i = 0; i < boardSize; ++i) {
          const idx1 = vertexId(boardSize, margin, { y: i, x: boardSize - i });
          const idx2 = vertexId(boardSize, margin, {
            y: i + 1,
            x: boardSize - (i + 1),
          });
          edges[`${idx1},${idx2}`] = 12;
        }
      }
    } else if (item.kind === "arrow") {
      arrows.push(item.cells.map((c) => positionId(boardSize, margin, c)));
    } else if (item.kind === "thermo") {
      thermos.push(item.cells.map((c) => positionId(boardSize, margin, c)));
    }
  }

  const zN = JSON.stringify(texts);
  const zY = JSON.stringify(symbols);
  const zE = JSON.stringify(edges);
  const z3 = JSON.stringify(arrows);
  const zT = JSON.stringify(thermos);
  const zL = JSON.stringify(lines);

  return `{zR:{z_:[]},zU:{z_:[]},z8:{z_:[]},zS:{},zN:${zN},z1:{},zY:${zY},zF:{},z2:{},zT:${zT},z3:${z3},zD:[],z0:[],z5:[],zL:${zL},zE:${zE},zW:{},zC:{},z4:{},z6:[],z7:[]}`;
};

const exportBoardDataToPenpa = (
  boardSize: number,
  data: BoardData[],
): string => {
  let margin = 0;
  for (const item of data) {
    margin = Math.max(margin, item.margin);
  }

  const n = boardSize + margin * 2;
  const allItems = [];
  for (const item of data) {
    for (const it of item.items) {
      allItems.push(it);
    }
  }

  const res = `${headerLine(n)}
${marginLine(margin)}
["1","2","1"]~zS~["",1]
${itemsLine(boardSize, margin, allItems)}

${cellsLine(boardSize, margin)}
[]
{"sol_surface":false,"sol_number":false,"sol_loopline":false,"sol_ignoreloopline":false,"sol_loopedge":false,"sol_ignoreborder":false,"sol_wall":false,"sol_square":false,"sol_circle":false,"sol_tri":false,"sol_arrow":false,"sol_math":false,"sol_battleship":false,"sol_tent":false,"sol_star":false,"sol_akari":false,"sol_mine":false}
"x"
"x"
[2,26,21]
{z9:zQ,zG:["1","2","1"],zQ:{zM:zP,zS:["",1],zL:["1",2],zE:["1",2],zW:["",2],zC:["1",10],zN:["1",1],zY:["circle_L",1],zP:[z3,""],zB:["",""],"move":["1",""],"combi":["battleship",""],"sudoku":["1",1]},zA:{zM:zS,zS:["",1],zL:["1",3],zE:["1",3],zW:["",3],zC:["1",10],zN:["1",2],zY:["circle_L",1],zP:[zT,""],zB:["",""],"move":["1",""],"combi":["battleship",""],"sudoku":["1",9]}}
"x"
0
{zR:{z_:[]},zU:{z_:[]},z8:{z_:[]},zS:{},zN:{},z1:{},zY:{},zF:{},z2:{},zT:[],z3:[],zD:[],z0:[],z5:[],zL:{},zE:{},zW:{},zC:{},z4:{},z6:[],z7:[]}
x
{"sol_or_surface":false,"sol_or_number":false,"sol_or_loopline":false,"sol_or_loopedge":false,"sol_or_wall":false,"sol_or_square":false,"sol_or_circle":false,"sol_or_tri":false,"sol_or_arrow":false,"sol_or_math":false,"sol_or_battleship":false,"sol_or_tent":false,"sol_or_star":false,"sol_or_akari":false,"sol_or_mine":false}
[]
false`;
  const urlPrefix = "https://opt-pan.github.io/penpa-edit/#m=solve&p=";
  return urlPrefix + deflateBase64(res);
};

export type ExportResult =
  | { status: "ok"; url: string }
  | { status: "error"; reason: string };

export const exportProblemToPenpa = (problem: Problem): ExportResult => {
  const data: BoardData[] = [];
  for (const rule of allRules) {
    if (problem.enabledRules.includes(rule.name)) {
      if (rule.exportToPenpa !== undefined) {
        data.push(rule.exportToPenpa(problem.ruleData.get(rule.name)));
      } else {
        return {
          status: "error",
          reason: `Export function not defined for rule "${rule.name}"`,
        };
      }
    }
  }
  const url = exportBoardDataToPenpa(problem.size, data);
  return { status: "ok", url };
};
