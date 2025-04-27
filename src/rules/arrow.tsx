import { Rule, PRIORITY_ARROW } from "../rule";

type Arrow = { y: number; x: number }[];

type ArrowState = {
  currentArrow: Arrow | null;
};

type ArrowData = {
  arrows: Arrow[];
};

export const arrowRule: Rule<ArrowState, ArrowData> = {
  name: "arrow",
  initialState: { currentArrow: null },
  initialData: (size: number) => ({
    arrows: [],
    size,
  }),
  eventTypes: ["cellMouseDown", "cellMouseMove", "mouseUp"],
  reducer: (state, data, event, info) => {
    const size = info.boardSize;
    if (event.type === "cellMouseDown") {
      if (event.rightClick) {
        const newArrows = data.arrows.filter(
          (arrow) =>
            !arrow.some((cell) => cell.y === event.y && cell.x === event.x),
        );
        return { data: { arrows: newArrows } };
      }
      if (
        state.currentArrow === null &&
        0 <= event.y &&
        event.y < size &&
        0 <= event.x &&
        event.x < size
      ) {
        const newArrow = [{ y: event.y, x: event.x }];
        return { state: { currentArrow: newArrow } };
      }
    } else if (event.type === "cellMouseMove") {
      if (
        state.currentArrow != null &&
        0 <= event.y &&
        event.y < size &&
        0 <= event.x &&
        event.x < size
      ) {
        const arrow = state.currentArrow;

        const last = arrow[arrow.length - 1];
        if (
          (last.y != event.y || last.x != event.x) &&
          Math.abs(last.y - event.y) <= 1 &&
          Math.abs(last.x - event.x) <= 1
        ) {
          if (
            arrow.length >= 2 &&
            arrow[arrow.length - 2].y === event.y &&
            arrow[arrow.length - 2].x === event.x
          ) {
            return { state: { currentArrow: arrow.slice(0, -1) } };
          } else {
            const newArrow = [...arrow, { y: event.y, x: event.x }];
            return { state: { currentArrow: newArrow } };
          }
        }
      }
    } else if (event.type === "mouseUp") {
      if (state.currentArrow != null && state.currentArrow.length >= 2) {
        return {
          state: { currentArrow: null },
          data: {
            arrows: [...data.arrows, state.currentArrow],
          },
        };
      }
    }
    return {};
  },
  render: (state, data, options) => {
    const arrows =
      state && state.currentArrow
        ? [...data.arrows, state.currentArrow]
        : data.arrows;
    const { cellSize, margin } = options;

    const items = [];

    for (let i = 0; i < arrows.length; ++i) {
      const arrow = arrows[i];

      const start = arrow[0];
      const startX = margin + (start.x + 0.5) * cellSize;
      const startY = margin + (start.y + 0.5) * cellSize;
      items.push(
        <circle
          key={`arrow-start-${i}`}
          cx={startX}
          cy={startY}
          r={cellSize * 0.4}
          stroke="rgb(192, 192, 192)"
          fill="none"
          strokeWidth={3}
        />,
      );
      for (let j = 1; j < arrow.length; ++j) {
        let startY = margin + (arrow[j - 1].y + 0.5) * cellSize;
        let startX = margin + (arrow[j - 1].x + 0.5) * cellSize;
        const endY = margin + (arrow[j].y + 0.5) * cellSize;
        const endX = margin + (arrow[j].x + 0.5) * cellSize;

        if (j === 1) {
          const d = Math.hypot(endY - startY, endX - startX);
          const dy = (endY - startY) / d;
          const dx = (endX - startX) / d;

          startY += dy * cellSize * 0.4;
          startX += dx * cellSize * 0.4;
        }

        items.push(
          <line
            key={`arrow-${i}-${j}`}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="rgb(192, 192, 192)"
            strokeWidth={3}
            strokeLinecap="round"
          />,
        );
      }

      if (arrow.length >= 2) {
        const last = arrow[arrow.length - 1];
        const secondLast = arrow[arrow.length - 2];

        const d = Math.hypot(last.y - secondLast.y, last.x - secondLast.x);
        const dy = (last.y - secondLast.y) / d;
        const dx = (last.x - secondLast.x) / d;

        const endY = margin + (last.y + 0.5) * cellSize;
        const endX = margin + (last.x + 0.5) * cellSize;

        const scale = 0.4 * Math.sqrt(0.5);

        items.push(
          <line
            key={`arrow-head-${i}`}
            x1={endX}
            y1={endY}
            x2={endX - dx * cellSize * scale + dy * cellSize * scale}
            y2={endY - dy * cellSize * scale - dx * cellSize * scale}
            stroke="rgb(192, 192, 192)"
            strokeWidth={3}
            strokeLinecap="round"
          />,
        );
        items.push(
          <line
            key={`arrow-head-${i}-2`}
            x1={endX}
            y1={endY}
            x2={endX - dx * cellSize * scale - dy * cellSize * scale}
            y2={endY - dy * cellSize * scale + dx * cellSize * scale}
            stroke="rgb(192, 192, 192)"
            strokeWidth={3}
            strokeLinecap="round"
          />,
        );
      }
    }

    return [
      {
        priority: PRIORITY_ARROW,
        item: <g>{items}</g>,
      },
    ];
  },
};
