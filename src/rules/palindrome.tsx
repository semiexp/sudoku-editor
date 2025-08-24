import { ReactElement } from "react";
import { Rule, PRIORITY_PALINDROME } from "../rule";
import { reducerForLines } from "./linesUtil";
import { Item } from "../penpaExporter";

type Palindrome = { y: number; x: number }[];

type PalindromeState = {
  currentPalindrome: Palindrome | null;
};

type PalindromeData = {
  palindromes: Palindrome[];
};

export const palindromeRule: Rule<PalindromeState, PalindromeData> = {
  name: "palindrome",
  initialState: { currentPalindrome: null },
  initialData: () => ({
    palindromes: [],
  }),
  eventTypes: ["cellMouseDown", "cellMouseMove", "mouseUp"],
  reducer: (state, data, event, info) => {
    return reducerForLines(
      state,
      data,
      "currentPalindrome",
      "palindromes",
      event,
      info,
    );
  },
  render: (state, data, options) => {
    const { cellSize, margin } = options;

    const items: ReactElement[] = [];

    const addPalindrome = (
      palindrome: Palindrome,
      i: number,
      color: string,
    ) => {
      for (let j = 0; j < palindrome.length - 1; ++j) {
        const start = palindrome[j];
        const end = palindrome[j + 1];

        const startX = margin + (start.x + 0.5) * cellSize;
        const startY = margin + (start.y + 0.5) * cellSize;
        const endX = margin + (end.x + 0.5) * cellSize;
        const endY = margin + (end.y + 0.5) * cellSize;

        items.push(
          <line
            key={`palindrome-${i}-${j}`}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={color}
            strokeWidth={cellSize * 0.2}
            strokeLinecap="round"
          />,
        );
      }
    };

    for (let i = 0; i < data.palindromes.length; ++i) {
      addPalindrome(data.palindromes[i], i, "rgb(176, 176, 176)");
    }
    if (state && state.currentPalindrome) {
      addPalindrome(
        state.currentPalindrome,
        data.palindromes.length,
        "rgb(176, 176, 255)",
      );
    }

    return [
      {
        priority: PRIORITY_PALINDROME,
        item: <g>{items}</g>,
      },
    ];
  },
  exportToPenpa: (data) => {
    const items: Item[] = [];

    for (const palindrome of data.palindromes) {
      for (let i = 0; i < palindrome.length - 1; ++i) {
        items.push({
          kind: "line",
          position1: palindrome[i],
          position2: palindrome[i + 1],
          style: 5,
        });
      }
    }

    return { items, margin: 0 };
  },
};
