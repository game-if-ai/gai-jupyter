/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from "react";
import { Notebook, Output, selectNotebook, useJupyter, Kernel } from "@datalayer/jupyter-react";
import { KernelManager } from '@jupyterlab/services';
import { ToastContainer, ToastContainerProps } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AppBar,
  Button,
  IconButton,
  MenuItem,
  Select,
  Switch,
  Toolbar,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  DarkMode,
  LightMode,
  PlayArrow,
  Save,
  Undo,
  QuestionMark,
  Info,
  Keyboard,
  KeyboardArrowRight,
  KeyboardArrowLeft,
} from "@mui/icons-material";

import { Activity, isGameActivity } from "../games";
import { Experiment, Simulation } from "../games/simulator";
import { useWithCellOutputs } from "../hooks/use-with-notebook";
import { useWithDialogue } from "../hooks/use-with-dialogue";
import {
  SHORTCUT_KEYS,
  useWithShortcutKeys,
} from "../hooks/use-with-shortcut-keys";
import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";
import { TooltipMsg } from "./Dialogue";
import { NotebookEditor } from "./NotebookEditor";
import { ActionPopup } from "./Popup";
import { useWithImproveCafeCode } from "../hooks/use-with-improve-cafe-code";

function NotebookComponent(props: {
  activity: Activity;
  curExperiment: Experiment<Simulation> | undefined;
  sawTutorial: boolean;
  setSawTutorial: (tf: boolean) => void;
  setExperiment: (e: number) => void;
  viewSummary: () => void;
  runSimulation: (i: number) => void;
  notebookRan: () => void;
  numRuns: number;
}): JSX.Element {
  const classes = useStyles();
  const dialogue = useWithDialogue();
  const notebook = selectNotebook(NOTEBOOK_UID);
  const shortcutKeyboard = useWithShortcutKeys();
  const { activity, curExperiment, sawTutorial, notebookRan, numRuns } = props;
  const {
    cells,
    isEdited,
    evaluationInput,
    evaluationOutput,
    lintModel,
    run,
    clearOutputs,
    editCode,
    undoCode,
    saveCode,
  } = useWithCellOutputs();

  const kernelManager : KernelManager = useJupyter().kernelManager as KernelManager;

  const [mode, setMode] = useState<"dark" | "light">("light");
  const [showUnsaved, setShowUnsaved] = useState<boolean>(false);
  const [kernel, setKernel] = useState<Kernel|undefined>();
  const [showDescription, setShowDescription] = useState<boolean>(!sawTutorial);
  const [loadedWithExperiment] = useState(Boolean(curExperiment)); //only evaluates when component first loads
  const { toastHint: toastCafeHint, hintsAvailable: cafeHintsAvailable } =
    useWithImproveCafeCode({
      numCodeRuns: numRuns,
      activeGame: activity,
    });

  if(kernel == undefined)
  {
   setKernel( new Kernel({
      kernelManager: kernelManager,
      kernelName: "Python3",
      } ));
  }
  useEffect(() => {
    if (!showDescription && !sawTutorial) {
      const messages = [];
      for (const c of Object.values(cells)) {
        const title = c.cell.getMetadata("gai_title") as string;
        const text = c.cell.getMetadata("gai_description") as string;
        const type = c.cell.getMetadata("gai_cell_type") as string;
        if (title && text && type) {
          messages.push({ id: `cell-${type}`, title, text });
        }
      }
      dialogue.addMessages([
        ...messages,
        {
          id: "save",
          title: "Save Code",
          text: "This is the save button. It will save all the changes you've made to edited notebook cells.",
        },
        {
          id: "undo",
          title: "Undo Code",
          text: "This is the undo button. It will reset all edited notebook cells to the state they were in during the last save. If you want to undo changes to an individual cell, use that notebook's undo button instead.",
        },
        {
          id: "run",
          title: "Run Code",
          text: "This is the run button. It will run all the notebook cells and generate the simulated output.",
        },
      ]);
      props.setSawTutorial(true);
    }
  }, [showDescription]);

  useEffect(() => {
    if (Boolean(evaluationInput.length && evaluationOutput.length)) {
      dialogue.addMessage({
        id: "view-sim",
        title: "Congrats!",
        text: "Go to see the results",
        noSave: true,
      });
    }
  }, [evaluationInput, evaluationOutput]);

  const [scrolledToCell, setScrolledToCell] = useState<boolean>(false);
  useEffect(() => {
    if (
      sawTutorial &&
      !scrolledToCell &&
      dialogue.messages.length === 0 &&
      !dialogue.curMessage
    ) {
      setScrolledToCell(true);
      document
        .getElementById(`cell-${GaiCellTypes.EVALUATION}`)
        ?.scrollIntoView();
    }
  }, [dialogue.messages, dialogue.curMessage]);

  function toSimulation(): void {
    activity.simulator.simulate(
      evaluationInput,
      evaluationOutput,
      notebook,
      activity.id
    );
    props.setExperiment(activity.simulator.experiments.length - 1);
    props.runSimulation(0);
  }

  function toSummary(): void {
    activity.simulator.simulate(
      evaluationInput,
      evaluationOutput,
      notebook,
      activity.id
    );
    props.setExperiment(activity.simulator.experiments.length - 1);
    props.viewSummary();
  }

  function simulate(): void {
    if (isEdited) {
      setShowUnsaved(true);
    } else {
      notebookRan();
      run();
    }
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <Select
            variant="standard"
            onChange={(e) => {
              document
                .getElementById(`cell-${e.target.value}`)
                ?.scrollIntoView();
            }}
            style={{ color: "white" }}
          >
            {Object.keys(cells).map((c, i) => (
              <MenuItem key={i} value={c}>
                {c.toLowerCase()}
              </MenuItem>
            ))}
          </Select>
          <div style={{ flexGrow: 1 }} />
          <Switch
            color="secondary"
            checked={mode === "dark"}
            icon={<LightMode className={classes.switchIcon} />}
            checkedIcon={
              <DarkMode
                className={classes.switchIcon}
                style={{ backgroundColor: "purple", color: "white" }}
              />
            }
            onChange={() => setMode(mode === "dark" ? "light" : "dark")}
          />
          <IconButton
            disabled={!cafeHintsAvailable || activity.id !== "cafe"}
            onClick={toastCafeHint}
          >
            <QuestionMark />
          </IconButton>
          <TooltipMsg elemId="save" dialogue={dialogue}>
            <IconButton disabled={!isEdited} onClick={saveCode}>
              <Save />
            </IconButton>
          </TooltipMsg>
          <TooltipMsg elemId="undo" dialogue={dialogue}>
            <IconButton disabled={!isEdited} onClick={undoCode}>
              <Undo />
            </IconButton>
          </TooltipMsg>
          <TooltipMsg elemId="run" dialogue={dialogue}>
            <IconButton onClick={simulate}>
              <PlayArrow />
            </IconButton>
          </TooltipMsg>
        </Toolbar>
      </AppBar>
      <Toolbar />
      {shortcutKeyboard.isOpen ? (
        <div className={classes.shortcutButtons}>
          <IconButton color="primary" onClick={shortcutKeyboard.toggleOpen}>
            <KeyboardArrowLeft />
            <Keyboard />
          </IconButton>
          {SHORTCUT_KEYS.map((s) => (
            <Button
              key={s.text}
              color="primary"
              onClick={() => shortcutKeyboard.setKey(s.key || s.text)}
            >
              {s.text}
            </Button>
          ))}
        </div>
      ) : (
        <div className={classes.infoButtons}>
          <Button
            sx={{ textTransform: "none" }}
            startIcon={<Info />}
            onClick={() => setShowDescription(true)}
          >
            Build a sentiment classifier model.
          </Button>
          <div style={{ flexGrow: 1 }} />
          <IconButton color="primary" onClick={shortcutKeyboard.toggleOpen}>
            <Keyboard />
            <KeyboardArrowRight />
          </IconButton>
        </div>
      )}
      <div className={classes.cells}>
        {Object.entries(cells).map((v) => (
          <NotebookEditor
            key={v[0]}
            activity={activity}
            cellType={v[0]}
            cellState={v[1]}
            mode={mode}
            editCode={editCode}
            dialogue={dialogue}
            shortcutKeyboard={shortcutKeyboard}
          />
        ))}
      </div>
      <div style={{ display: "none" }}>
        <Output autoRun={true} code={`%load_ext pycodestyle_magic`} />
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
              : `${props.activity.id}/test.ipynb`
          }
          uid={NOTEBOOK_UID}
        />
        <Notebook model={lintModel} uid={`${NOTEBOOK_UID}-lint`} />
      </div>
      <ActionPopup
        open={Boolean(evaluationInput.length && evaluationOutput.length)}
        onClose={clearOutputs}
        title="See results"
        text="Would you like to view your results?"
      >
        <Button onClick={clearOutputs}>Cancel</Button>
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
        open={showUnsaved}
        onClose={() => setShowUnsaved(false)}
        title="Unsaved Code Changes"
        text="Would you like to run without saving? You will lose any unsaved code changes."
      >
        <Button
          onClick={() => {
            dialogue.addMessage({
              id: "save",
              text: "Don't forget to save your changes before running again!",
              noSave: true,
            });
            setShowUnsaved(false);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            run();
            setShowUnsaved(false);
          }}
        >
          Run Anyway
        </Button>
      </ActionPopup>
      <ActionPopup
        open={showDescription}
        onClose={() => setShowDescription(false)}
        title={activity.title}
        text="Please complete this notebook to build a sentiment classifier. You will receive hints on how to improve its performance as you go."
      >
        <Button onClick={() => setShowDescription(false)}>Okay</Button>
      </ActionPopup>
      <ToastContainer {...defaultToastOptions} />
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
  switchIcon: {
    width: 16,
    height: 16,
    padding: 2,
    borderRadius: 16,
    backgroundColor: "white",
    color: "red",
  },
  shortcutButtons: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    overflowX: "scroll",
    whiteSpace: "nowrap",
  },
  infoButtons: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
}));

export default NotebookComponent;
