import { ReactElement, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useHistory } from "./history";
import {
  EditorEvent,
  handleKeyDown,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  useKeyDown,
} from "./events";
import { RenderOptions, Rule } from "./rule";
import { allRules } from "./rules/rules";
import { solve } from "./solver";
import { Answer, Problem, defaultProblem } from "./puzzle";
import { loadProblemFromString, saveProblemAsString } from "./serialize";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Toolbar,
  Typography,
  MenuItem,
  Select,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import AddBox from "@mui/icons-material/AddBox";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import SaveIcon from "@mui/icons-material/Save";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import HelpIcon from "@mui/icons-material/Help";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { TooltipButton } from "./components/tooltipButton";
import { NewBoardDialog } from "./dialogs/newBoardDialog";
import { ExportDialog } from "./dialogs/exportDialog";
import { LoadDialog } from "./dialogs/loadDialog";
import { SaveDialog } from "./dialogs/saveDialog";
import { HelpDialog } from "./dialogs/helpDialog";
import { openDialog } from "./dialogs/dialog";
import { NumberKeypad } from "./components/NumberKeypad";
import "./editor.css";

export type EditorProps = {
  problem: Problem;
  onChangeProblem: (problem: Problem) => void;
};

const defaultBorders = (options: RenderOptions) => {
  const { boardSize, cellSize, margin } = options;

  const ret = [];
  for (let i = 0; i <= boardSize; ++i) {
    // horizontal lines
    const width = i === 0 || i === boardSize ? 3 : 1;
    ret.push(
      <line
        key={`h-${i}`}
        x1={margin - width * 0.5}
        y1={margin + i * cellSize}
        x2={margin + boardSize * cellSize + width * 0.5}
        y2={margin + i * cellSize}
        stroke="black"
        strokeWidth={width}
      />,
    );
  }
  for (let i = 0; i <= boardSize; ++i) {
    // vertical lines
    const width = i === 0 || i === boardSize ? 3 : 1;
    ret.push(
      <line
        key={`v-${i}`}
        x1={margin + i * cellSize}
        y1={margin - width * 0.5}
        x2={margin + i * cellSize}
        y2={margin + boardSize * cellSize + width * 0.5}
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
  options: RenderOptions,
) => {
  if (answer === null) {
    return [];
  }

  const size = problem.size;

  if (answer.decidedNumbers.length !== size) {
    return [];
  }

  const hasClue = [];
  const givenNumbersRule: any = problem.ruleData.get("givenNumbers"); // eslint-disable-line @typescript-eslint/no-explicit-any
  for (let y = 0; y < size; ++y) {
    const row = [];
    for (let x = 0; x < size; ++x) {
      row.push(givenNumbersRule.numbers[y][x] !== null);
    }
    hasClue.push(row);
  }

  const answerRule: any = problem.ruleData.get("answer"); // eslint-disable-line @typescript-eslint/no-explicit-any
  const answerNumbers: (number | null)[][] = answerRule.numbers; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { cellSize, margin } = options;
  const items = [];
  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      if (hasClue[y][x]) {
        continue;
      }

      let hasMismatch = false;
      const answerNum = answerNumbers[y][x];
      if (answerNum !== null) {
        for (let i = 0; i < size; ++i) {
          if (answer.candidates[y][x][i] !== (answerNum - 1 === i)) {
            hasMismatch = true;
          }
        }
        if (hasMismatch) {
          items.push(
            <rect
              key={`auto-solver-${y}-${x}-mismatch`}
              x={margin + x * cellSize + 2}
              y={margin + y * cellSize + 2}
              width={cellSize - 4}
              height={cellSize - 4}
              strokeWidth={2}
              stroke="rgba(255, 0, 0)"
              fill="rgba(255, 0, 255, 0.3)"
            />,
          );
        }
      }
      if (answer.decidedNumbers[y][x] !== null) {
        if (answerNum !== answer.decidedNumbers[y][x]) {
          items.push(
            <text
              key={`auto-solver-${y}-${x}`}
              x={margin + x * cellSize + cellSize * 0.5}
              y={margin + y * cellSize + cellSize * 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={cellSize * 0.7}
              style={{ userSelect: "none" }}
              fill="rgb(64, 128, 255)"
            >
              {answer.decidedNumbers[y][x]}
            </text>,
          );
        }
      } else {
        const candidates = answer.candidates[y][x];
        const w = Math.ceil(Math.sqrt(size));
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
                fontSize={(cellSize / w) * 0.9}
                style={{ userSelect: "none" }}
                fill="rgb(64, 128, 255)"
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
  lastSelectedRuleIndex: number;
  ruleState: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const RuleSelector = (props: {
  ruleState: RuleState;
  changeSelectedRule: (newRuleIndex: number) => void;
  problem: Problem;
  updateProblem: (newProblem: Problem) => void;
}) => {
  const { ruleState, changeSelectedRule, problem, updateProblem } = props;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ruleBox = (rule: Rule<any, any>, index: number) => {
    const isSelected = ruleState.selectedRuleIndex === index;
    return (
      <div className="ruleBox" key={`rule-${index}`}>
        <Box
          className={isSelected ? "ruleTitle selectedRuleTitle" : "ruleTitle"}
          onClick={() => changeSelectedRule(index)}
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
              disabled={rule.name === "givenNumbers" || rule.name === "answer"}
              sx={{ verticalAlign: "middle" }}
            />
            <Typography component="span" sx={{ verticalAlign: "middle" }}>
              {t(`rule.${rule.name}.title`)}
            </Typography>
          </Box>
        </Box>
        {isSelected && rule.name !== "answer" && (
          <Box sx={{ padding: "5px", borderTop: "1px solid black" }}>
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
                        sx={{ pl: 2 }}
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
  };
  return (
    <Box className="ruleContainerOuter">
      {allRules.map(
        (rule, index) => rule.name === "answer" && ruleBox(rule, index),
      )}
      <div className="ruleContainerInner">
        {allRules.map(
          (rule, index) => rule.name !== "answer" && ruleBox(rule, index),
        )}
      </div>
    </Box>
  );
};

const useEventDispatcher = (
  problem: Problem,
  updateProblem: (newProblem: Problem) => void,
  ruleState: RuleState,
  setRuleState: (newRuleState: RuleState) => void,
) => {
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

        const info = {
          boardSize: problem.size,
        };

        const result = rule.reducer(
          ruleState.ruleState,
          problem.ruleData.get(rule.name),
          event,
          info,
        );
        if (result.state) {
          setRuleState({ ...ruleState, ruleState: result.state });
        }
        if (result.data) {
          const newRuleData = new Map(problem.ruleData);
          newRuleData.set(rule.name, result.data);
          updateProblem({
            ...problem,
            ruleData: newRuleData,
          });
        }
      }
    };
  }, [problem, ruleState]);

  return dispatchEventRef;
};

const render = (
  problem: Problem,
  autoSolverAnswer: Answer,
  selectedRuleIndex: number,
  ruleState: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  options: RenderOptions,
): ReactElement[] => {
  const renderResults: { priority: number; item: ReactElement }[] = [];

  for (let i = 0; i < allRules.length; ++i) {
    const rule = allRules[i];
    const state = i === selectedRuleIndex ? ruleState : null;
    const data = problem.ruleData.get(rule.name);

    // check if the rule is enabled
    if (problem.enabledRules.indexOf(rule.name) < 0) {
      continue;
    }

    const renderResult = rule.render(state, data, options);
    for (let j = 0; j < renderResult.length; ++j) {
      renderResults.push({
        priority: renderResult[j].priority,
        item: <g key={`rule-${i}-${j}`}>{renderResult[j].item}</g>,
      });
    }
  }

  renderResults.push({
    priority: 0,
    item: <g key="defaultBorders">{defaultBorders(options)}</g>,
  });
  renderResults.push({
    priority: 100,
    item: (
      <g key="autoSolverItems">
        {autoSolverItems(problem, autoSolverAnswer, options)}
      </g>
    ),
  });

  renderResults.sort((a, b) => a.priority - b.priority);

  return renderResults.map((c) => c.item);
};

export const Editor = (props: EditorProps) => {
  const problem = props.problem;
  const size = problem.size;

  const [ruleState, setRuleState] = useState<RuleState>({
    selectedRuleIndex: -1,
    lastSelectedRuleIndex: -1,
    ruleState: null,
  });
  const [enableSolver, setEnableSolver] = useState(false);
  const [autoSolverAnswer, setAutoSolverAnswer] = useState<Answer | null>(null);
  const [cellSize, setCellSize] = useState(40); // Make cellSize dynamic
  const [keypadVisible, setKeypadVisible] = useState(false);
  const [svgContainerHeight, setSvgContainerHeight] = useState(0);

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const problemHistory = useHistory(problem, props.onChangeProblem);

  const margin = cellSize + 10;
  const svgSize = margin * 2 + cellSize * props.problem.size;

  const renderOptions = {
    boardSize: size,
    cellSize: cellSize,
    margin: margin,
  };
  const renderResults = render(
    problem,
    autoSolverAnswer,
    ruleState.selectedRuleIndex,
    ruleState.ruleState,
    renderOptions,
  );

  useEffect(() => {
    if (enableSolver) {
      setAutoSolverAnswer(solve(problem));
    } else {
      setAutoSolverAnswer(null);
    }
  }, [problem, enableSolver]);

  const dispatchEventRef = useEventDispatcher(
    problem,
    problemHistory.update,
    ruleState,
    setRuleState,
  );
  const changeSelectedRule = (newRuleIndex: number) => {
    if (newRuleIndex === ruleState.selectedRuleIndex) {
      return;
    }
    setRuleState({
      selectedRuleIndex: newRuleIndex,
      lastSelectedRuleIndex:
        ruleState.selectedRuleIndex === 0
          ? ruleState.lastSelectedRuleIndex
          : ruleState.selectedRuleIndex,
      ruleState: allRules[newRuleIndex].initialState,
    });
  };
  const onTab = () => {
    if (ruleState.selectedRuleIndex !== 0) {
      changeSelectedRule(0);
    } else {
      changeSelectedRule(ruleState.lastSelectedRuleIndex);
    }
  };
  useKeyDown((e) => handleKeyDown(e, dispatchEventRef.current, onTab));

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setSvgContainerHeight(entries[0].contentRect.height);
      }
    });

    if (svgContainerRef.current) {
      resizeObserver.observe(svgContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const { t, i18n } = useTranslation();

  const handleKeypadPress = (key: string) => {
    if (dispatchEventRef.current) {
      const event = { type: "keyDown" as const, key };
      dispatchEventRef.current(event);
    }
  };

  return (
    <Box>
      <Toolbar variant="dense" sx={{ backgroundColor: "#eeeeee", pl: "20px" }}>
        <TooltipButton
          onClick={async () => {
            const newProblemSpec = await openDialog(NewBoardDialog, {
              size: 9,
              blockWidth: 3,
            });
            if (newProblemSpec === undefined) {
              return;
            }
            const newProblem = defaultProblem(
              newProblemSpec.size,
              newProblemSpec.blockWidth,
            );
            problemHistory.reset(newProblem);
            setAutoSolverAnswer(null);
          }}
          sx={{ ml: -2 }}
          title={t("ui.newBoard")}
        >
          <AddBox />
        </TooltipButton>
        <TooltipButton
          title={t("ui.load")}
          onClick={async () => {
            const loaded = await openDialog(LoadDialog, { content: "" });
            if (loaded === undefined) {
              return;
            }
            const newProblem = loadProblemFromString(loaded.content);
            problemHistory.reset(newProblem);
          }}
        >
          <FileOpenIcon />
        </TooltipButton>
        <TooltipButton
          title={t("ui.save")}
          onClick={async () => {
            const problemAsString = saveProblemAsString(problem);
            await openDialog(SaveDialog, { content: problemAsString });
          }}
        >
          <SaveIcon />
        </TooltipButton>
        <TooltipButton
          title={t("ui.export")}
          onClick={async () => {
            await openDialog(ExportDialog, { problem: props.problem });
          }}
        >
          <SaveAltIcon />
        </TooltipButton>
        <TooltipButton
          title={t("ui.undo")}
          onClick={problemHistory.undo}
          disabled={!problemHistory.canUndo}
        >
          <UndoIcon />
        </TooltipButton>
        <TooltipButton
          title={t("ui.redo")}
          onClick={problemHistory.redo}
          disabled={!problemHistory.canRedo}
        >
          <RedoIcon />
        </TooltipButton>
        <TooltipButton
          title={t("ui.zoomIn")}
          onClick={() => setCellSize((prev) => Math.min(prev + 10, 100))}
        >
          <ZoomInIcon />
        </TooltipButton>
        <TooltipButton
          title={t("ui.zoomOut")}
          onClick={() => setCellSize((prev) => Math.max(prev - 10, 20))}
        >
          <ZoomOutIcon />
        </TooltipButton>
        <TooltipButton
          title={t("ui.keypad")}
          onClick={() => setKeypadVisible(!keypadVisible)}
          sx={{
            backgroundColor: keypadVisible ? "primary.main" : "transparent",
            color: keypadVisible ? "white" : "inherit",
            "&:hover": {
              backgroundColor: keypadVisible ? "primary.dark" : "action.hover",
            },
          }}
        >
          <KeyboardIcon />
        </TooltipButton>
        <TooltipButton
          title={t("ui.autoSolver")}
          onClick={() => setEnableSolver(!enableSolver)}
          sx={{
            backgroundColor: enableSolver ? "primary.main" : "transparent",
            color: enableSolver ? "white" : "inherit",
            "&:hover": {
              backgroundColor: enableSolver ? "primary.dark" : "action.hover",
            },
          }}
        >
          <AutoFixHighIcon />
        </TooltipButton>
        <Select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          sx={{ ml: "auto" }}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="ja">日本語</MenuItem>
        </Select>
        <TooltipButton
          title={t("ui.help")}
          onClick={async () => {
            await openDialog(HelpDialog, { initialValues: {} });
          }}
        >
          <HelpIcon />
        </TooltipButton>
      </Toolbar>
      <Box sx={{ display: "flex" }}>
        <Box ref={svgContainerRef}>
          <svg
            width={svgSize}
            height={svgSize}
            onMouseDown={(e) =>
              handleMouseDown(e, cellSize, margin, dispatchEventRef.current)
            }
            onMouseMove={(e) =>
              handleMouseMove(e, cellSize, margin, dispatchEventRef.current)
            }
            onMouseUp={() => handleMouseUp(dispatchEventRef.current)}
            onMouseLeave={() => handleMouseUp(dispatchEventRef.current)}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              fontFamily: "sans-serif",
              border: "1px solid black",
              margin: "5px",
            }}
          >
            {renderResults}
          </svg>
        </Box>
        <Box sx={{ height: svgContainerHeight, width: "100%" }}>
          <RuleSelector
            ruleState={ruleState}
            changeSelectedRule={changeSelectedRule}
            problem={problem}
            updateProblem={problemHistory.update}
          />
        </Box>
      </Box>
      <NumberKeypad
        onKeyPress={handleKeypadPress}
        isVisible={keypadVisible}
        onClose={() => setKeypadVisible(false)}
      />
    </Box>
  );
};
