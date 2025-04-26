import { ReactElement, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useHistory } from "./history";
import { EditorEvent, handleMouseDown } from "./events";
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
import "./editor.css";

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

const defaultBorders = (size: number, cellSize: number, margin: number) => {
  const ret = [];
  for (let i = 0; i <= size; ++i) {
    // horizontal lines
    let width = i === 0 || i === size ? 3 : 1;
    ret.push(
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
    ret.push(
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
  return ret;
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

type RuleState = {
  selectedRuleIndex: number;
  ruleState: any;
};

const RuleSelector = (props: {
  ruleState: RuleState;
  setRuleState: (newRuleState: RuleState) => void;
  problem: Problem;
  updateProblem: (newProblem: Problem) => void;
}) => {
  const { ruleState, setRuleState, problem, updateProblem } = props;
  const { t } = useTranslation();

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

    updateProblem(newProblem);
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

    updateProblem({
      ...problem,
      ruleData: newRuleData,
    });
  };

  return (
    <Box className="ruleContainerOuter">
      <div className="ruleContainerInner">
        {allRules.map((rule, index) => {
          const isSelected = ruleState.selectedRuleIndex === index;
          return (
            <div className="ruleBox" key={`rule-${index}`}>
              <Box
                className={
                  isSelected ? "ruleTitle selectedRuleTitle" : "ruleTitle"
                }
                onClick={() => {
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
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onChange={(e) => {
                      onChangeEnabledRules(rule.name, e.target.checked);
                    }}
                    checked={problem.enabledRules.indexOf(rule.name) >= 0}
                    disabled={rule.name === "givenNumbers"}
                    sx={{ verticalAlign: "middle" }}
                  />
                  <Typography component="span" sx={{ verticalAlign: "middle" }}>
                    {t(`rule.${rule.name}.title`)}
                  </Typography>
                </Box>
              </Box>
              {isSelected && (
                <Box sx={{ padding: "5px" }}>
                  <Typography>{t(`rule.${rule.name}.explanation`)}</Typography>
                  {rule.booleanFlags &&
                    rule.booleanFlags.map((flag) => {
                      return (
                        <FormControlLabel
                          key={flag}
                          control={
                            <Checkbox
                              checked={problem.ruleData.get(rule.name)[flag]}
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
  );
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
  const problemHistory = useHistory(problem, props.onChangeProblem);

  const cellSize = 40; // TODO: make this dynamic
  const margin = cellSize + 10;
  const svgSize = margin * 2 + cellSize * props.problem.size;

  const renderOptions = {
    boardSize: size,
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
    item: <g>{defaultBorders(size, cellSize, margin)}</g>,
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
          problemHistory.update({
            ...problem,
            ruleData: newRuleData,
          });
        }
      }
    };
  }, [props, ruleState]);

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

  const { t, i18n } = useTranslation();

  return (
    <Box>
      <Toolbar variant="dense" sx={{ backgroundColor: "#eeeeee", pl: "20px" }}>
        <IconButton
          onClick={problemHistory.undo}
          disabled={!problemHistory.canUndo}
          sx={{ ml: -2 }}
        >
          <UndoIcon />
        </IconButton>
        <IconButton
          onClick={problemHistory.redo}
          disabled={!problemHistory.canRedo}
        >
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
            onMouseDown={(e) =>
              handleMouseDown(e, cellSize, margin, dispatchEventRef.current)
            }
            style={{ fontFamily: "sans-serif" }}
          >
            {renderResults.map((c) => c.item)}
          </svg>
        </Box>
        <RuleSelector
          ruleState={ruleState}
          setRuleState={setRuleState}
          problem={problem}
          updateProblem={problemHistory.update}
        />
      </Box>
    </Box>
  );
};
