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
import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, ToastContainerProps } from "react-toastify";
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
import { PlayArrow, Info, Restore, ErrorOutline } from "@mui/icons-material";

import { Activity, isGameActivity } from "../games";
import { useWithNotebook } from "../hooks/use-with-notebook";
import { useWithDialogue } from "../hooks/use-with-dialogue";
import { useWithShortcutKeys } from "../hooks/use-with-shortcut-keys";
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

import "react-toastify/dist/ReactToastify.css";
import { AllExperimentTypes } from "../games/activity-types";
import { useWithImproveCode } from "../hooks/use-with-improve-code";

export enum KernelConnectionStatus {
  CONNECTING = "CONNECTING",
  UNKNOWN = "UNKOWN",
  FINE = "FINE",
}

function NotebookComponent(props: {
  uniqueUserId: string;
  activity: Activity;
  curExperiment: AllExperimentTypes | undefined;
  numRuns: number;
  setExperiment: (e: number) => void;
  viewSummary: () => void;
  runSimulation: (i: number) => void;
  notebookRan: () => void;
}): JSX.Element {
  const classes = useStyles();
  const dialogue = useWithDialogue();
  const notebook = selectNotebook(NOTEBOOK_UID);
  const shortcutKeyboard = useWithShortcutKeys();
  const { activity, curExperiment, notebookRan, numRuns, uniqueUserId } = props;
  const {
    cells,
    setupCellOutput,
    validationCellOutput,
    userInputCellsCode,
    hasError,
    isSaving,
    editCode,
    resetCode,
    notebookIsRunning,
  } = useWithNotebook({ curActivity: activity });
  const hints = useWithImproveCode({
    userCode: userInputCellsCode,
    validationCellOutput: validationCellOutput,
    numCodeRuns: numRuns,
    activeActivity: activity,
    notebookIsRunning: notebookIsRunning,
  });
  const showTutorial = Boolean(sessionStorageGet("show_walkthrough"));
  const sawTutorial = Boolean(sessionStorageGet("saw_notebook_walkthrough"));
  const [curCell, setCurCell] = useState<string>("");
  const [showDescription, setShowDescription] = useState<boolean>(!sawTutorial);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loadedWithExperiment] = useState(Boolean(curExperiment)); //only evaluates when component first loads
  const [kernel, setKernel] = useState<Kernel>();
  const [didScroll, setDidScroll] = useState<boolean>(false);
  const [pastExperiments] = useState(props.activity.simulator.experiments);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [kernelStatus, setKernelStatus] = useState(
    KernelConnectionStatus.CONNECTING
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const kernelManager: KernelManager = useJupyter()
    .kernelManager as KernelManager;

  useEffect(() => {
    if (kernel) {
      window.onbeforeunload = () => {
        if (kernel) {
          console.log("shutting down kernel");
          kernel.shutdown();
        }
      };
    }

    return () => {
      if (kernel) {
        console.log("shutting down kernel");
        kernel.shutdown();
      }
    };
  }, [kernel]);

  function connectToNewKernel() {
    if (!kernelManager) {
      return;
    }
    setKernelStatus(KernelConnectionStatus.CONNECTING);
    const newKernel = new Kernel({ kernelManager, kernelName: "python" });
    newKernel
      .getJupyterKernel()
      .then((kernelConnection) => {
        kernelConnection.statusChanged.connect((statusChange) => {
          switch (statusChange.status) {
            case "starting":
            case "restarting":
            case "autorestarting":
              setKernelStatus(KernelConnectionStatus.CONNECTING);
              break;
            case "idle":
            case "busy":
              setKernelStatus(KernelConnectionStatus.FINE);
              break;
            // case "terminating":
            // case "dead":
            // case "unknown":
            default:
              setKernelStatus(KernelConnectionStatus.UNKNOWN);
              break;
          }
        });
      })
      .catch(() => {
        setKernelStatus(KernelConnectionStatus.UNKNOWN);
      });
    setKernel(newKernel);
  }

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
      dialogue.addMessages([
        ...messages,
        {
          id: "reset",
          title: "Reset Code",
          text: "This is the reset button. It will reset all edited notebook cells to the state they were in originally. If you want to undo changes to an individual cell, use that notebook's undo button instead.",
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
      dialogue.messages.length === 0 &&
      !dialogue.curMessage &&
      Object.values(cells).length > 0
    ) {
      setDidScroll(true);
      const modelCell = Object.values(cells).find(
        (c) => c.cell.getMetadata("gai_cell_type") === GaiCellTypes.MODEL
      );
      if (modelCell) {
        setCurCell(modelCell.cell.id);
        scrollTo(modelCell.cell.id);
      }
    }
  }, [
    showDescription,
    sawTutorial,
    dialogue.messages,
    dialogue.curMessage,
    cells,
  ]);

  function toSimulation(): void {
    if (!notebook) {
      return;
    }
    activity.simulator.simulate(
      setupCellOutput,
      validationCellOutput,
      notebook,
      activity.id
    );
    props.setExperiment(activity.simulator.experiments.length - 1);
    props.runSimulation(0);
  }

  function toSummary(): void {
    if (!notebook) {
      return;
    }
    activity.simulator.simulate(
      setupCellOutput,
      validationCellOutput,
      notebook,
      activity.id
    );
    props.setExperiment(activity.simulator.experiments.length - 1);
    props.viewSummary();
  }

  function simulate(): void {
    notebookRan();
    setShowResults(true);
  }

  function onReset(event: React.MouseEvent<HTMLButtonElement>): void {
    if (pastExperiments.length === 0) {
      resetCode();
    } else {
      setAnchorEl(event.currentTarget);
    }
  }

  function scrollTo(cell: string): void {
    const element = document.getElementById(`cell-${cell}`);
    if (!element || !scrollRef.current) {
      return;
    }
    const offsetPosition =
      element.offsetTop - 75 - (shortcutKeyboard.isOpen ? 50 : 0);
    scrollRef.current.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }

  function kernelStatusDisplay(): JSX.Element {
    if (isSaving) {
      return (
        <div style={{ color: "#9h0EE90", fontWeight: "bold" }}>
          Kernel Saving Code...
        </div>
      );
    }
    if (notebookIsRunning) {
      return (
        <div style={{ color: "#90EE90", fontWeight: "bold" }}>
          Kernel Executing Code...
        </div>
      );
    }
    switch (kernelStatus) {
      case KernelConnectionStatus.CONNECTING:
        return (
          <div style={{ color: "white", fontWeight: "bold" }}>
            Kernel Connecting...
          </div>
        );
      case KernelConnectionStatus.UNKNOWN:
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
            }}
          >
            <div style={{ color: "red", fontWeight: "bold" }}>
              Kernel Connection Failure
            </div>
            <Button
              onClick={connectToNewKernel}
              style={{
                color: "black",
                padding: 0,
                margin: 0,
                border: "solid black 1px",
                backgroundColor: "lightgrey",
              }}
            >
              Reconnect
            </Button>
          </div>
        );
      case KernelConnectionStatus.FINE:
        return (
          <div style={{ color: "#90EE90", fontWeight: "bold" }}>
            Kernel Idle
          </div>
        );
    }
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <Select
            value={curCell}
            onChange={(e) => {
              scrollTo(e.target.value);
              setCurCell(e.target.value);
            }}
            style={{ color: "white", maxWidth: "50%" }}
          >
            {Object.keys(cells)
              .filter((cellKey) => !cells[cellKey].cell.getMetadata("hidden"))
              .map((c, i) => (
                <MenuItem key={i} value={c}>
                  {cells[c].cell.getMetadata("gai_title")}
                </MenuItem>
              ))}
          </Select>
          <div style={{ flexGrow: 1 }} />
          {kernelStatusDisplay()}
          <IconButton onClick={() => setShowDescription(true)}>
            <Info />
          </IconButton>
          <TooltipMsg elemId="reset" dialogue={dialogue}>
            <IconButton onClick={onReset}>
              <Restore />
            </IconButton>
          </TooltipMsg>
          <TooltipMsg elemId="run" dialogue={dialogue}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSaving || notebookIsRunning ? (
                <CircularProgress
                  style={{ color: "white", position: "absolute" }}
                  size={28}
                />
              ) : undefined}
              {hasError ? (
                <ErrorOutline style={{ position: "absolute", fontSize: 28 }} />
              ) : undefined}
              <IconButton
                disabled={
                  hasError ||
                  isSaving ||
                  !Boolean(
                    setupCellOutput.length && validationCellOutput.length
                  )
                }
                onClick={simulate}
              >
                <PlayArrow />
              </IconButton>
            </div>
          </TooltipMsg>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <ShortcutKeyboard shortcutKeyboard={shortcutKeyboard} />
      {Object.entries(cells).length === 0 ? <CircularProgress /> : undefined}
      <div className={classes.cells} ref={scrollRef}>
        {Object.entries(cells)
          .filter((v) => !v[1].cell.getMetadata("hidden"))
          .map((v) => (
            <NotebookEditor
              key={v[0]}
              activity={activity}
              cellState={v[1]}
              editCode={editCode}
              dialogue={dialogue}
              shortcutKeyboard={shortcutKeyboard}
              hints={hints}
            />
          ))}
      </div>
      <div style={{ display: "none" }}>
        <Notebook
          kernel={kernel}
          model={
            loadedWithExperiment && curExperiment?.notebookContent
              ? curExperiment.notebookContent
              : undefined
          }
          path={
            loadedWithExperiment && curExperiment?.notebookContent
              ? undefined
              : `/${TEMP_NOTEBOOK_DIR}/${uniqueUserId}/${props.activity.id}/test.ipynb`
          }
          uid={NOTEBOOK_UID}
        />
      </div>
      <ActionPopup
        open={showResults}
        onClose={() => setShowResults(false)}
        title="See results"
        text="Would you like to view your results?"
      >
        {isGameActivity(activity) ? (
          <TooltipMsg elemId="view-sim" dialogue={dialogue} placement="bottom">
            <Button onClick={toSimulation}>View Simulation</Button>
          </TooltipMsg>
        ) : undefined}
        <TooltipMsg
          elemId="view-summary"
          dialogue={dialogue}
          placement="bottom"
        >
          <Button onClick={toSummary}>View Summary</Button>
        </TooltipMsg>
      </ActionPopup>
      <ActionPopup
        open={showDescription}
        onClose={() => setShowDescription(false)}
        title={activity.title}
        text={activity.description}
      >
        <Button onClick={() => setShowDescription(false)}>Okay</Button>
      </ActionPopup>
      <ToastContainer {...defaultToastOptions} />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Select
          onChange={(e) => {
            const idx = e.target.value as number;
            if (idx === -1) {
              resetCode();
            } else {
              resetCode(pastExperiments[idx]);
            }
            setAnchorEl(null);
          }}
          style={{ color: "white", width: 200 }}
        >
          {pastExperiments.map((e, i) => (
            <MenuItem key={i} value={i}>
              {`${e.time}`}
            </MenuItem>
          ))}
        </Select>
      </Popover>
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
