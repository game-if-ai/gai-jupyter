/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import {
  Kernel,
  Notebook,
  selectNotebook,
  useJupyter,
} from "@datalayer/jupyter-react";
import { KernelManager } from "@jupyterlab/services";
import {
  AppBar,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Popover,
  Select,
  Toolbar,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  PlayArrow,
  Info,
  Restore,
  Save,
  HelpOutlineOutlined,
} from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, ToastContainerProps } from "react-toastify";

import { isGameActivity } from "../games";
import { useWithNotebook } from "../hooks/use-with-notebook";
import { useWithDialogue } from "../store/dialogue/useWithDialogue";
import {
  GaiCellTypes,
  NOTEBOOK_UID,
  TEMP_NOTEBOOK_DIR,
} from "../local-constants";
import { sessionStorageGet, sessionStorageStore } from "../local-storage";
import { TooltipMsg } from "./Dialogue";
import { NotebookEditor } from "./NotebookEditor";
import { ActionPopup } from "./Popup";
import { ShortcutKeyboard } from "./ShortcutKeyboard";
import { useWithImproveCode } from "../hooks/use-with-improve-code";
import { STEP } from "../store/state";
import { useAppDispatch, useAppSelector } from "../store";
import { useWithState } from "../store/state/useWithState";
import { useWithSimulator } from "../store/simulator/useWithSimulator";
import { setCurCell, updateLocalNotebook } from "../store/notebook";

import "react-toastify/dist/ReactToastify.css";
import { useWithExperimentsStore } from "../hooks/use-with-experiments-store";
import { ErrorDialog } from "./dialog";
import { Experiment } from "store/simulator";

export enum KernelConnectionStatus {
  CONNECTING = "CONNECTING",
  UNKNOWN = "UNKOWN",
  FINE = "FINE",
}

function NotebookComponent(props: { uniqueUserId: string }): JSX.Element {
  const { uniqueUserId } = props;
  const dispatch = useAppDispatch();
  const activity = useAppSelector((s) => s.state.activity!);
  const experiment = useAppSelector((s) => s.state.experiment);
  const localNotebook = useAppSelector(
    (s) => s.notebookState.localNotebooks[activity.id]
  );
  const isKeyboardOpen = useAppSelector((s) => s.keyboard.isOpen);

  const { curCell, isRunning } = useAppSelector((s) => s.notebookState);

  const classes = useStyles();
  const { loadSimulation, loadExperiment, toStep } = useWithState();
  const { messages, curMessage, addMessages } = useWithDialogue();
  const notebook = selectNotebook(NOTEBOOK_UID);

  const {
    cells,
    validationCellOutput,
    userInputCellsCode,
    executionError,
    unexpectedError,
    isEdited,
    initialConnectionMade: notebookInitialized,
    notebookRunCount,
    editCode,
    resetCode,
    saveNotebook,
    saveLocalChanges,
    runNotebook,
    clearError,
  } = useWithNotebook({
    curActivity: activity,
    curExperiment: experiment,
  });
  const errorOccured = Boolean(executionError || unexpectedError);

  const hints = useWithImproveCode({
    userCode: userInputCellsCode,
    validationCellOutput: validationCellOutput,
    activeActivity: activity!,
    notebookRunCount,
  });
  const showTutorial = Boolean(sessionStorageGet("show_walkthrough"));
  const sawTutorial = Boolean(sessionStorageGet("saw_notebook_walkthrough"));
  const [showDescription, setShowDescription] = useState<boolean>(!sawTutorial);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showLocalChanges, setShowLocalChanges] = useState<boolean>(
    Boolean(localNotebook && !experiment)
  );
  const [kernel, setKernel] = useState<Kernel>();
  const [historyPopup, setHistoryPopup] = useState<HTMLButtonElement | null>(
    null
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [didScroll, setDidScroll] = useState<boolean>(false);
  const simulator = useWithSimulator();
  const { getPastExperiments, clearExperimentHistory } =
    useWithExperimentsStore();
  const pastExperiments = getPastExperiments(activity.id);
  const kernelManager: KernelManager = useJupyter()
    .kernelManager as KernelManager;

  function sortPreviousExperiments(experiments: Experiment[]) {
    if (!experiments || experiments.length === 0 || experiments.length === 1) {
      return experiments;
    }
    return [...experiments].sort((a, b) => {
      return b.time.getTime() - a.time.getTime();
    });
  }

  useEffect(() => {
    if (showResults && errorOccured) {
      setShowResults(false);
    }
  }, [showResults, errorOccured]);

  useEffect(() => {
    if (kernel) {
      window.onbeforeunload = () => {
        if (kernel) {
          console.log("shutting down kernel");
          kernel.getJupyterKernel().then((k) => {
            if (k) {
              k.shutdown();
            }
          });
        }
      };
    }

    return () => {
      if (kernel) {
        console.log("shutting down kernel");
        kernel.getJupyterKernel().then((k) => {
          if (k) {
            k.shutdown();
          }
        });
      }
    };
  }, [kernel]);

  useEffect(() => {
    if (kernel) {
      return;
    }
    connectToNewKernel();
  }, [kernelManager]);

  useEffect(() => {
    if (showDescription || sawTutorial) {
      return;
    }
    sessionStorageStore("saw_notebook_walkthrough", "true");
    if (showTutorial) {
      const messages = [];
      for (const c of Object.values(cells)) {
        const title = c.cell.getMetadata("gai_title") as string;
        const text = c.cell.getMetadata("gai_description") as string;
        const type = c.cell.getMetadata("gai_cell_type") as string;
        if (title && text && type) {
          messages.push({ id: `cell-${c.cell.id}`, title, text });
        }
      }
      if (hints.hintsAvailable) {
        messages.push({
          id: "hint",
          title: "Hints",
          text: "This is the hint button. It will give you suggestions based on your current code implementation.",
        });
      }
      addMessages([
        ...messages,
        {
          id: "reset",
          title: "Reset Code",
          text: "This is the reset button. It will reset all edited notebook cells to a previous run state.",
        },
        {
          id: "run",
          title: "Run Code",
          text: "This is the run button. It will save the current changes then run all notebook cells and generate the simulated output.",
        },
      ]);
    }
  }, [showDescription, showTutorial, sawTutorial]);

  useEffect(() => {
    if (
      !didScroll &&
      sawTutorial &&
      !showDescription &&
      messages.length === 0 &&
      !curMessage &&
      Object.values(cells).length > 0
    ) {
      setDidScroll(true);
      const modelCell = Object.values(cells).find(
        (c) => c.metadata?.gai_cell_type === GaiCellTypes.MODEL
      );
      if (modelCell) {
        dispatch(setCurCell(modelCell.cell.id));
        scrollTo(modelCell.cell.id);
      }
    }
  }, [showDescription, sawTutorial, messages, curMessage, cells]);

  function connectToNewKernel() {
    if (!kernelManager) {
      return;
    }
    const newKernel = new Kernel({ kernelManager, kernelName: "python" });
    newKernel
      .getJupyterKernel()
      .then((kernelConnection) => {
        kernelConnection.statusChanged.connect((statusChange) => {
          switch (statusChange.status) {
            case "starting":
            case "restarting":
            case "autorestarting":
              break;
            case "idle":
            case "busy":
              break;
            // case "terminating":
            // case "dead":
            // case "unknown":
            default:
              break;
          }
        });
      })
      .catch(() => {});
    setKernel(newKernel);
  }

  function saveAndRun(): void {
    if (isRunning) return;
    saveNotebook();
    simulate();
  }

  function toSimulation(): void {
    if (!notebook) {
      return;
    }
    loadSimulation(0);
  }

  function simulate(): void {
    if (!notebook) {
      return;
    }
    runNotebook()
      .then((ranNotebook) => {
        if (!ranNotebook || !ranNotebook.result || !ranNotebook.success) {
          return;
        }
        const [setupCellOutput, validationCellOutput] = [
          JSON.parse(ranNotebook.result[0]),
          JSON.parse(ranNotebook.result[1]),
        ];
        const experiment = simulator.simulate(
          setupCellOutput,
          validationCellOutput,
          ranNotebook.notebook,
          hints.getDisplayedHints()
        );
        dispatch(updateLocalNotebook({ id: activity.id, notebook: undefined }));
        loadExperiment(experiment);
        setShowResults(true);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  function onReset(event: React.MouseEvent<HTMLButtonElement>): void {
    setHistoryPopup(event.currentTarget);
  }
  function scrollTo(cell: string): void {
    dispatch(setCurCell(cell));
    const element = document.getElementById(`cell-${cell}`);
    if (!element || !scrollRef.current) {
      return;
    }
    const offsetPosition = element.offsetTop - 75 - (isKeyboardOpen ? 50 : 0);
    scrollRef.current.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }

  function onScroll(_e: React.UIEvent<HTMLDivElement, UIEvent>): void {
    if (!scrollRef.current) return;
    // check which cell is most visible and set it as the current cell in dropdown
    let visibleCell;
    let visibleCellPercent = 0;
    const scrollTop = scrollRef.current.offsetTop + scrollRef.current.scrollTop;
    const scrollBot = scrollTop + scrollRef.current.offsetHeight;
    for (const cellId of Object.keys(cells).filter(
      (cellKey) => !cells[cellKey].hiddenCell
    )) {
      const cellEle = document.getElementById(`cell-${cellId}`);
      if (cellEle) {
        // Calculate percentage of the element that's been seen
        const cellTop = cellEle.offsetTop;
        const cellHeight = cellEle.offsetHeight;
        const cellBot = cellTop + cellHeight;
        const percentage = Math.max(
          0,
          ((cellHeight -
            Math.max(0, scrollTop - cellTop) -
            Math.max(0, cellBot - scrollBot)) /
            cellHeight) *
            100
        );
        if (!visibleCell || percentage > visibleCellPercent) {
          visibleCell = cellId;
          visibleCellPercent = percentage;
        }
      }
    }
    if (visibleCell && visibleCell !== curCell) {
      dispatch(setCurCell(visibleCell));
    }
  }
  const visibleCells = Object.entries(cells).filter((v) => !v[1].hiddenCell);
  return (
    <div data-cy="notebook-root" className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <Select
            data-cy="select"
            data-test={curCell}
            value={curCell}
            onChange={(e) => scrollTo(e.target.value)}
            style={{ color: "white" }}
          >
            {visibleCells.map((v, i) => (
              <MenuItem data-cy="select-item" value={v[0]}>
                {v[1].metadata?.gai_title}
              </MenuItem>
            ))}
          </Select>
          <div style={{ flexGrow: 1 }} />
          <IconButton
            data-cy="info-btn"
            onClick={() => setShowDescription(true)}
          >
            <Info />
          </IconButton>
          <TooltipMsg elemId="hint">
            <IconButton
              data-cy="hint-btn-header"
              disabled={!hints.hintsAvailable}
              onClick={() => hints.toastHint()}
            >
              <HelpOutlineOutlined />
            </IconButton>
          </TooltipMsg>
          <TooltipMsg elemId="reset">
            <IconButton
              data-cy="experiment-history-btn"
              onClick={onReset}
              disabled={!pastExperiments.length}
            >
              <Restore />
            </IconButton>
          </TooltipMsg>
          <TooltipMsg elemId="run">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isRunning ? (
                <CircularProgress
                  style={{ color: "white", position: "absolute" }}
                  size={28}
                />
              ) : undefined}
              {isEdited ? (
                <IconButton
                  data-cy="save-btn"
                  disabled={isRunning}
                  onClick={saveAndRun}
                >
                  <Save />
                </IconButton>
              ) : (
                <IconButton
                  data-cy="run-btn"
                  disabled={isRunning}
                  onClick={saveAndRun}
                >
                  <PlayArrow />
                </IconButton>
              )}
            </div>
          </TooltipMsg>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <ShortcutKeyboard />
      {Object.entries(cells).length === 0 || !notebookInitialized ? (
        <span
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {" "}
          <span
            style={{ color: "#1976d2", fontWeight: "bold", marginRight: "5px" }}
          >
            Loading Notebook
          </span>{" "}
          <CircularProgress />{" "}
        </span>
      ) : (
        <div
          data-cy="cells"
          className={classes.cells}
          ref={scrollRef}
          onScroll={onScroll}
        >
          {visibleCells.map((v, i) => (
            <NotebookEditor
              key={v[0]}
              cellState={v[1]}
              hints={hints}
              editCode={editCode}
              saveLocalChanges={saveLocalChanges}
              onChangeCell={(direction: number) => {
                const newCell = visibleCells[i + direction];
                if (newCell) {
                  scrollTo(newCell[0]);
                }
              }}
            />
          ))}
        </div>
      )}
      <div style={{ display: "none" }}>
        <Notebook
          kernel={kernel}
          path={`/${TEMP_NOTEBOOK_DIR}/${uniqueUserId}/${
            activity!.id
          }/test2.ipynb`}
          uid={NOTEBOOK_UID}
        />
      </div>
      <ActionPopup
        open={showDescription}
        onClose={() => setShowDescription(false)}
        title={activity!.title}
        text={activity!.notebookDescription}
      >
        <Button data-cy="okay-btn" onClick={() => setShowDescription(false)}>
          Okay
        </Button>
      </ActionPopup>
      <ActionPopup
        open={showResults && !errorOccured}
        onClose={() => setShowResults(false)}
        title="See results"
        text="Would you like to view your results?"
      >
        {isGameActivity(activity!) ? (
          <TooltipMsg elemId="view-sim" placement="bottom">
            <Button data-cy="view-sim-btn" onClick={toSimulation}>
              View Simulation
            </Button>
          </TooltipMsg>
        ) : undefined}
        <TooltipMsg elemId="view-summary" placement="bottom">
          <Button data-cy="view-sum-btn" onClick={() => toStep(STEP.SUMMARY)}>
            View Summary
          </Button>
        </TooltipMsg>
      </ActionPopup>
      <ActionPopup
        open={showLocalChanges}
        onClose={() => {}}
        title="Found unsaved changes"
        text="You have unsaved code from a previous session. Would you like to load it?"
      >
        <Button
          onClick={() => {
            setShowLocalChanges(false);
            dispatch(
              updateLocalNotebook({ id: activity.id, notebook: undefined })
            );
          }}
        >
          No, start fresh
        </Button>
        <Button
          onClick={() => {
            resetCode(undefined, localNotebook);
            setShowLocalChanges(false);
            dispatch(
              updateLocalNotebook({ id: activity.id, notebook: undefined })
            );
          }}
        >
          Yes, load previous
        </Button>
      </ActionPopup>
      <Popover
        open={Boolean(historyPopup)}
        anchorEl={historyPopup}
        onClose={() => setHistoryPopup(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {sortPreviousExperiments(pastExperiments).map((e, i) => (
          <MenuItem
            key={e.id}
            data-cy={`experiment-history-${i}`}
            onClick={() => {
              resetCode(e);
              setHistoryPopup(null);
            }}
          >
            {`${new Date(e.time).toLocaleTimeString()}`}
          </MenuItem>
        ))}
        {pastExperiments.length > 0 ? (
          <MenuItem
            onClick={() => {
              clearExperimentHistory(activity.id);
              setHistoryPopup(null);
            }}
          >
            Clear Past Experiments
          </MenuItem>
        ) : undefined}
      </Popover>
      <ToastContainer {...defaultToastOptions} />
      <ErrorDialog error={unexpectedError} clearError={clearError} />
    </div>
  );
}

const defaultToastOptions: ToastContainerProps = {
  position: "bottom-left",
  autoClose: 20000,
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100vh",
    alignItems: "center",
    textAlign: "left",
  },
  cells: {
    width: "100%",
    flex: 1,
    overflowY: "scroll",
  },
  infoButtons: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
}));

export default NotebookComponent;
