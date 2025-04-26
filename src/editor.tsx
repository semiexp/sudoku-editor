import { ReactElement, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { EditorEvent } from "./rule";
import { allRules } from "./rules/rules";
import { solve } from "./solver";
import { Answer, Problem } from "./puzzle";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Switch,
  Toolbar,
  Typography,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

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
};

const autoSolverItems = (
  problem: Problem,
  answer: Answer,
  cellSize: number,
  margin: number,
) => {
  if (answer === null) {
    return [];
  }

  const size = problem.size;

  const hasClue = [];
  const givenNumbersRule: any = problem.ruleData.get("givenNumbers");
  for (let y = 0; y < size; ++y) {
    const row = [];
    for (let x = 0; x < size; ++x) {
      row.push(givenNumbersRule.numbers[y][x] !== null);
    }
    hasClue.push(row);
  }

  const items = [];
  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      if (hasClue[y][x]) {
        continue;
      }

      if (answer.decidedNumbers[y][x] !== null) {
        items.push(
          <text
            key={`auto-solver-${y}-${x}`}
            x={margin + x * cellSize + cellSize * 0.5}
            y={margin + y * cellSize + cellSize * 0.5}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={cellSize * 0.7}
            style={{ userSelect: "none" }}
            fill="green"
          >
            {answer.decidedNumbers[y][x]}
          </text>,
        );
      } else {
        const candidates = answer.candidates[y][x];
        const w = 3; // TODO
        for (let i = 0; i < size; ++i) {
          if (candidates[i]) {
            items.push(
              <text
                key={`auto-solver-candidate-${y}-${x}-${i}`}
                x={margin + x * cellSize + (((i % w) + 0.5) / w) * cellSize}
                y={
                  margin +
                  y * cellSize +
                  ((Math.floor(i / w) + 0.5) / w) * cellSize
                }
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={cellSize * 0.3}
                style={{ userSelect: "none" }}
                fill="green"
              >
                {i + 1}
              </text>,
            );
          }
        }
      }
    }
  }

  return items;
};

export const Editor = (props: EditorProps) => {
  const problem = props.problem;
  const size = problem.size;

  const [ruleState, setRuleState] = useState<{
    selectedRuleIndex: number;
    ruleState: any;
  }>({
    selectedRuleIndex: -1,
    ruleState: null,
  });
  const [enableSolver, setEnableSolver] = useState(false);
  const [autoSolverAnswer, setAutoSolverAnswer] = useState<Answer | null>(null);
  const [history, setHistory] = useState<Problem[]>([]); // History stack for undo functionality
  const [redoHistory, setRedoHistory] = useState<Problem[]>([]); // Redo stack for redo functionality

  const cellSize = 40; // TODO: make this dynamic
  const margin = cellSize + 10;
  const svgSize = margin * 2 + cellSize * props.problem.size;

  const defaultBorders = [];
  for (let i = 0; i <= size; ++i) {
    // horizontal lines
    let width = i === 0 || i === size ? 3 : 1;
    defaultBorders.push(
      <line
        key={`h-${i}`}
        x1={margin - width * 0.5}
        y1={margin + i * cellSize}
        x2={margin + size * cellSize + width * 0.5}
        y2={margin + i * cellSize}
        stroke="black"
        strokeWidth={width}
      />,
    );
  }
  for (let i = 0; i <= size; ++i) {
    // vertical lines
    let width = i === 0 || i === size ? 3 : 1;
    defaultBorders.push(
      <line
        key={`v-${i}`}
        x1={margin + i * cellSize}
        y1={margin - width * 0.5}
        x2={margin + i * cellSize}
        y2={margin + size * cellSize + width * 0.5}
        stroke="black"
        strokeWidth={width}
      />,
    );
  }

  const renderOptions = {
    cellSize: cellSize,
    margin: margin,
  };
  const renderResults: { priority: number; item: ReactElement }[] = [];

  for (let i = 0; i < allRules.length; ++i) {
    const rule = allRules[i];
    const state =
      i === ruleState.selectedRuleIndex ? ruleState.ruleState : null;
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
    item: <g>{defaultBorders}</g>,
  });
  renderResults.push({
    priority: 100,
    item: <g>{autoSolverItems(problem, autoSolverAnswer, cellSize, margin)}</g>,
  });

  renderResults.sort((a, b) => a.priority - b.priority);

  const dispatchEventRef = useRef<(event: EditorEvent) => void | null>(null);

  useEffect(() => {
    if (enableSolver) {
      setAutoSolverAnswer(solve(problem));
    } else {
      setAutoSolverAnswer(null);
    }
  }, [problem, enableSolver]);

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

        const result = rule.reducer(
          ruleState.ruleState,
          problem.ruleData.get(rule.name),
          event,
        );
        if (result.state) {
          setRuleState({ ...ruleState, ruleState: result.state });
        }
        if (result.data) {
          const newRuleData = new Map(problem.ruleData);
          newRuleData.set(rule.name, result.data);
          setHistory((prevHistory) => [...prevHistory, problem]);
          setRedoHistory([]);
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

      const edgeCands: {
        x: number;
        y: number;
        direction: "horizontal" | "vertical";
        distance: number;
      }[] = [
        { x: x, y: y, direction: "horizontal", distance: py - y * cellSize },
        { x: x, y: y, direction: "vertical", distance: px - x * cellSize },
        {
          x: x,
          y: y + 1,
          direction: "horizontal",
          distance: (y + 1) * cellSize - py,
        },
        {
          x: x + 1,
          y: y,
          direction: "vertical",
          distance: (x + 1) * cellSize - px,
        },
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

  const onChangeEnabledRules = (
    targetRule: string,
    stateAfterChange: boolean,
  ) => {
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

    setHistory([...history, problem]); // Save current state to history before changing
    setRedoHistory([]); // Clear redo history
    props.onChangeProblem(newProblem);
  };

  const onChangeRuleBooleanFlags = (
    rule: string,
    flag: string,
    stateAfterChange: boolean,
  ) => {
    const current = problem.ruleData.get(rule)[flag];
    if (current === stateAfterChange) {
      return;
    }

    const newRuleData = new Map(problem.ruleData);
    const newRuleState = { ...newRuleData.get(rule), [flag]: stateAfterChange };
    newRuleData.set(rule, newRuleState);

    setHistory([...history, problem]); // Save current state to history before changing
    setRedoHistory([]); // Clear redo history
    props.onChangeProblem({
      ...problem,
      ruleData: newRuleData,
    });
  };

  const undo = () => {
    if (history.length > 0) {
      const previousProblem = history[history.length - 1];
      setHistory(history.slice(0, -1)); // Remove the last state from history
      setRedoHistory([props.problem, ...redoHistory]); // Save current state to redo stack
      props.onChangeProblem(previousProblem); // Revert to the previous state
    }
  };

  const redo = () => {
    if (redoHistory.length > 0) {
      const nextProblem = redoHistory[0];
      setRedoHistory(redoHistory.slice(1)); // Remove the first state from redo stack
      setHistory([...history, props.problem]); // Save current state to history stack
      props.onChangeProblem(nextProblem); // Move to the next state
    }
  };

  const { t, i18n } = useTranslation();

  return (
    <Box>
      <Toolbar variant="dense" sx={{ backgroundColor: "#eeeeee", pl: "20px" }}>
        <IconButton
          onClick={undo}
          disabled={history.length === 0}
          sx={{ ml: -2 }}
        >
          <UndoIcon />
        </IconButton>
        <IconButton onClick={redo} disabled={redoHistory.length === 0}>
          <RedoIcon />
        </IconButton>
        <FormControlLabel
          control={
            <Switch
              checked={enableSolver}
              onChange={(e) => setEnableSolver(e.target.checked)}
            />
          }
          label={t("ui.autoSolver")}
          sx={{ ml: 0.5 }}
        />
        <Select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          sx={{ ml: "auto" }}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="ja">日本語</MenuItem>
        </Select>
      </Toolbar>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ border: "1px solid black", margin: "5px" }}>
          <svg
            width={svgSize}
            height={svgSize}
            onMouseDown={svgMouseDown}
            style={{ fontFamily: "sans-serif" }}
          >
            {renderResults.map((c) => c.item)}
          </svg>
        </Box>
        <Box sx={{ width: "100%" }}>
          <div style={{ overflowY: "scroll", height: "100%" }}>
            {allRules.map((rule, index) => {
              const isSelected = ruleState.selectedRuleIndex === index;
              return (
                <div
                  key={`rule-${index}`}
                  style={{
                    margin: "5px",
                    border: "1px solid black",
                  }}
                >
                  <Box
                    sx={
                      isSelected
                        ? {
                            width: "100%",
                            borderBottom: "1px solid black",
                            backgroundColor: "lightblue",
                            cursor: "pointer",
                          }
                        : { width: "100%", cursor: "pointer" }
                    }
                    onClick={(e) => {
                      // TODO: maybe ad-hoc?
                      if (e.target instanceof HTMLInputElement) {
                        return;
                      }
                      if (ruleState.selectedRuleIndex !== index) {
                        setRuleState({
                          selectedRuleIndex: index,
                          ruleState: rule.initialState,
                        });
                      }
                    }}
                  >
                    <Box sx={{ padding: "5px" }}>
                      <Checkbox
                        onChange={(e) => {
                          onChangeEnabledRules(rule.name, e.target.checked);
                        }}
                        checked={problem.enabledRules.indexOf(rule.name) >= 0}
                        disabled={rule.name === "givenNumbers"}
                        sx={{ verticalAlign: "middle" }}
                      />
                      <Typography
                        component="span"
                        sx={{ verticalAlign: "middle" }}
                      >
                        {t(`rule.${rule.name}.title`)}
                      </Typography>
                    </Box>
                  </Box>
                  {isSelected && (
                    <Box sx={{ padding: "5px" }}>
                      <Typography>
                        {t(`rule.${rule.name}.explanation`)}
                      </Typography>
                      {rule.booleanFlags &&
                        rule.booleanFlags.map((flag) => {
                          return (
                            <FormControlLabel
                              key={flag}
                              control={
                                <Checkbox
                                  checked={
                                    problem.ruleData.get(rule.name)[flag]
                                  }
                                  onChange={(e) =>
                                    onChangeRuleBooleanFlags(
                                      rule.name,
                                      flag,
                                      e.target.checked,
                                    )
                                  }
                                />
                              }
                              label={t(`rule.${rule.name}.${flag}`)}
                            />
                          );
                        })}
                    </Box>
                  )}
                </div>
              );
            })}
          </div>
        </Box>
      </Box>
    </Box>
  );
};
