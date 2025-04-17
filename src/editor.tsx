import { ReactElement, useEffect, useRef, useState } from "react";

import { EditorEvent } from "./rule";
import { allRules } from "./rules/rules";

export type Problem = {
  size: number;
  enabledRules: string[];
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
    enabledRules: ["givenNumbers", "blocks"],
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

  const renderOptions = {
    cellSize: cellSize,
    margin: margin,
  };
  const renderResults: { priority: number; item: ReactElement }[] = [];

  for (let i = 0; i < allRules.length; ++i) {
    const rule = allRules[i];
    const state = i === ruleState.selectedRuleIndex ? ruleState.ruleState : null;
    const data = problem.ruleData.get(rule.name);

    // check if the rule is enabled
    if (problem.enabledRules.indexOf(rule.name) < 0) {
      continue;
    }

    const renderResult = rule.render(state, data, renderOptions);
    for (const item of renderResult) {
      renderResults.push(item);
    }
  }

  renderResults.push({
    priority: 0,
    item: (<g>
      {defaultBorders}
    </g>),
  });
  renderResults.sort((a, b) => a.priority - b.priority);

  const dispatchEventRef = useRef<(event: EditorEvent) => void | null>(null);

  useEffect(() => {
    dispatchEventRef.current = (event: EditorEvent) => {
      if (ruleState.selectedRuleIndex >= 0) {
        const rule = allRules[ruleState.selectedRuleIndex];

        // currently selected rule is not enabled
        if (problem.enabledRules.indexOf(rule.name) < 0) {
          return;
        }

        // the rule does not handle this event
        if (rule.eventTypes.indexOf(event.type) < 0) {
          return;
        }

        const result = rule.reducer(ruleState.ruleState, problem.ruleData.get(rule.name), event);
        if (result.state) {
          setRuleState({ ...ruleState, ruleState: result.state });
        }
        if (result.data) {
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

    if (dispatchEventRef.current === null) {
      return;
    }
    const dispatchEvent = dispatchEventRef.current;

    // cell
    {
      const x = Math.floor((e.clientX - rect.left - margin) / cellSize);
      const y = Math.floor((e.clientY - rect.top - margin) / cellSize);

      const event: EditorEvent = { type: "cellMouseDown", x: x, y: y };
      dispatchEvent(event);
    }

    // edge
    {
      const px = e.clientX - rect.left - margin;
      const py = e.clientY - rect.top - margin;

      const x = Math.floor(px / cellSize);
      const y = Math.floor(py / cellSize);

      const edgeCands: {x: number; y: number; direction: "horizontal" | "vertical"; distance: number }[] = [
        { x: x, y: y, direction: "horizontal", distance: py - y * cellSize },
        { x: x, y: y, direction: "vertical", distance: px - x * cellSize },
        { x: x, y: y + 1, direction: "horizontal", distance: (y + 1) * cellSize - py },
        { x: x + 1, y: y, direction: "vertical", distance: (x + 1) * cellSize - px },
      ];

      const minEdge = edgeCands.reduce((prev, curr) => {
        if (prev.distance < curr.distance) {
          return prev;
        } else {
          return curr;
        }
      });

      if (minEdge.distance < cellSize * 0.3) {
        const event: EditorEvent = {
          type: "edgeMouseDown",
          x: minEdge.x,
          y: minEdge.y,
          direction: minEdge.direction,
        };
        dispatchEvent(event);
      }
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

  const onChangeEnabledRules = (targetRule: string, stateAfterChange: boolean) => {
    const current = problem.enabledRules.indexOf(targetRule) >= 0;
    if (current === stateAfterChange) {
      return;
    }

    const newEnabledRules = stateAfterChange
      ? [...problem.enabledRules, targetRule]
      : problem.enabledRules.filter((rule) => rule !== targetRule);
    const newProblem = {
      ...problem,
      enabledRules: newEnabledRules,
    };

    props.onChangeProblem(newProblem);
  };

  return <div>
    <div>
      <svg width={svgSize} height={svgSize} onMouseDown={svgMouseDown}>
        {renderResults.map((c) => c.item)}
      </svg>
    </div>
    <div>
      {allRules.map((rule, index) => {
        const bgColor = ruleState.selectedRuleIndex === index ? "lightblue" : "white";
        return <div
          key={`rule-${index}`}
          onClick={(e) => {
            // TODO: maybe ad-hoc?
            if (e.target instanceof HTMLInputElement) {
              return;
            }
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
          <input
            type="checkbox"
            onChange={(e) => {
              onChangeEnabledRules(rule.name, e.target.checked);
            }}
            checked={problem.enabledRules.indexOf(rule.name) >= 0}
            disabled={rule.name === "givenNumbers"}
          />
          {rule.description}
        </div>
      })}
    </div>
  </div>
};
