import { useEffect, useRef, useState } from "react";

import { EditorEvent } from "./rule";
import { allRules } from "./rules/rules";

export type Problem = {
  size: number;
  ruleData: Map<string, any>;
};

export type EditorProps = {
  problem: Problem;
  onChangeProblem: (problem: Problem) => void;
};

export const defaultProblem = (size: number): Problem => {
  const ruleData = new Map<string, any>();
  for (const rule of allRules) {
    ruleData.set(rule.name, rule.initialData(size));
  }
  return {
    size: size,
    ruleData: ruleData,
  };
}

export const Editor = (props: EditorProps) => {
  const problem = props.problem;
  const size = problem.size;

  const [ruleState, setRuleState] = useState<{selectedRuleIndex: number, ruleState: any}>({
    selectedRuleIndex: -1,
    ruleState: null,
  });

  const cellSize = 40;  // TODO: make this dynamic
  const margin = cellSize + 10;
  const svgSize = margin * 2 + cellSize * props.problem.size;

  const defaultBorders = [];
  for (let i = 0; i <= size; ++i) {
    // horizontal lines
    let width = (i === 0 || i === size) ? 3 : 1;
    defaultBorders.push(
      <line
        key={`h-${i}`}
        x1={margin - width * 0.5}
        y1={margin + i * cellSize}
        x2={margin + size * cellSize + width * 0.5}
        y2={margin + i * cellSize}
        stroke="black"
        strokeWidth={width}
      />
    );
  }
  for (let i = 0; i <= size; ++i) {
    // vertical lines
    let width = (i === 0 || i === size) ? 3 : 1;
    defaultBorders.push(
      <line
        key={`v-${i}`}
        x1={margin + i * cellSize}
        y1={margin - width * 0.5}
        x2={margin + i * cellSize}
        y2={margin + size * cellSize + width * 0.5}
        stroke="black"
        strokeWidth={width}
      />
    );
  }

  const svgBackgroundItems = [];
  const svgForegroundItems = [];
  const renderOptions = {
    cellSize: cellSize,
    margin: margin,
  };

  for (let i = 0; i < allRules.length; ++i) {
    const rule = allRules[i];
    const state = i === ruleState.selectedRuleIndex ? ruleState.ruleState : null;
    const data = problem.ruleData.get(rule.name);

    const renderResult = rule.render(state, data, renderOptions);
    if (renderResult.background) {
      svgBackgroundItems.push(renderResult.background);
    }
    if (renderResult.foreground) {
      svgForegroundItems.push(renderResult.foreground);
    }
  }

  const dispatchEventRef = useRef<(event: EditorEvent) => void | null>(null);

  useEffect(() => {
    dispatchEventRef.current = (event: EditorEvent) => {
      if (ruleState.selectedRuleIndex >= 0) {
        const rule = allRules[ruleState.selectedRuleIndex];
        const result = rule.reducer(ruleState.ruleState, problem.ruleData.get(rule.name), event);
        if (result.state) {
          setRuleState({ ...ruleState, ruleState: result.state });
        }
        if (result.data) {
          // problem.ruleData.set(rule.name, result.data);
          const newRuleData = new Map(problem.ruleData);
          newRuleData.set(rule.name, result.data);
          props.onChangeProblem({
            ...problem,
            ruleData: newRuleData,
          });
        }
      }  
    };
  }, [props, ruleState]);

  const svgMouseDown = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - margin) / cellSize);
    const y = Math.floor((e.clientY - rect.top - margin) / cellSize);

    if (dispatchEventRef.current) {
      const event: EditorEvent = { type: "cellMouseDown", x: x, y: y };
      dispatchEventRef.current(event);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (dispatchEventRef.current) {
      const event: EditorEvent = { type: "keyDown", key: e.key };
      dispatchEventRef.current(event);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return <div>
    <div>
      <svg width={svgSize} height={svgSize} onMouseDown={svgMouseDown}>
        {svgBackgroundItems}
        {defaultBorders}
        {svgForegroundItems}
      </svg>
    </div>
    <div>
      {allRules.map((rule, index) => {
        const bgColor = ruleState.selectedRuleIndex === index ? "lightblue" : "white";
        return <div
          key={`rule-${index}`}
          onClick={() => {
            if (ruleState.selectedRuleIndex !== index) {
              setRuleState({ selectedRuleIndex: index, ruleState: rule.initialState });
            }
          }}
          style={{
            backgroundColor: bgColor,
            padding: "10px",
            margin: "5px",
            border: "1px solid black",
            cursor: "pointer",
          }}
        >
          {rule.description}
        </div>
      })}
    </div>
  </div>
};
