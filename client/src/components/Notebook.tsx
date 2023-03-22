/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from "react";
import { Notebook, Output, selectNotebook } from "@datalayer/jupyter-react";
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
  BugReport,
  DarkMode,
  FormatColorText,
  Info,
  LightMode,
  PlayArrow,
  Save,
  Undo,
  QuestionMark,
} from "@mui/icons-material";

import { Game } from "../games";
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
  game: Game;
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
  const { game, curExperiment, sawTutorial, notebookRan, numRuns } = props;
  const {
    cells,
    isEdited,
    evaluationInput,
    evaluationOutput,
    run,
    clearOutputs,
    editCode,
    undoCode,
    saveCode,
    formatCode,
  } = useWithCellOutputs();
  const [mode, setMode] = useState<"dark" | "light">("light");
  const [showUnsaved, setShowUnsaved] = useState<boolean>(false);
  const [showDescription, setShowDescription] = useState<boolean>(!sawTutorial);
  const [loadedWithExperiment] = useState(Boolean(curExperiment)); //only evaluates when component first loads
  const { toastHint: toastCafeHint, hintsAvailable: cafeHintsAvailable } =
    useWithImproveCafeCode({
      numCodeRuns: numRuns,
      activeGame: game,
    });

  useEffect(() => {
    if (!showDescription && !sawTutorial) {
      document
        .getElementById(`cell-${GaiCellTypes.EVALUATION}`)
        ?.scrollIntoView();
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

  function toSimulation(): void {
    game.simulator.simulate(evaluationInput, evaluationOutput, notebook);
    props.setExperiment(game.simulator.experiments.length - 1);
    props.runSimulation(0);
  }

  function toSummary(): void {
    game.simulator.simulate(evaluationInput, evaluationOutput, notebook);
    props.setExperiment(game.simulator.experiments.length - 1);
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
            value={GaiCellTypes.EVALUATION}
            onChange={(e) => {
              if (e.target.value) {
                document
                  .getElementById(`cell-${e.target.value}`)
                  ?.scrollIntoView();
              }
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
          <IconButton
            disabled={!cafeHintsAvailable || game.id !== "cafe"}
            onClick={toastCafeHint}
          >
            <QuestionMark />
          </IconButton>
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
      <div
        className={classes.buttons}
        style={{
          display: shortcutKeyboard.isOpen ? "block" : "none",
          backgroundColor: mode === "dark" ? "#171a22" : "#f6f8fa",
        }}
      >
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
      <div className={classes.cells}>
        {Object.entries(cells).map((v) => (
          <NotebookEditor
            key={v[0]}
            game={game}
            cellType={v[0]}
            cellState={v[1]}
            mode={mode}
            editCode={editCode}
            dialogue={dialogue}
            shortcutKeyboard={shortcutKeyboard}
          />
        ))}
      </div>
      <Toolbar
        className={classes.buttons}
        style={{
          justifyContent: "center",
          backgroundColor: mode === "dark" ? "#171a22" : "#f6f8fa",
        }}
      >
        <Button startIcon={<Info />} onClick={() => setShowDescription(true)}>
          Info
        </Button>
        <Button startIcon={<FormatColorText />} onClick={formatCode}>
          Format
        </Button>
        <Button startIcon={<BugReport />}>Debug</Button>
      </Toolbar>
      <div style={{ display: "none" }}>
        <Output autoRun={true} code={`%load_ext pycodestyle_magic`} />
        <Notebook
          model={
            loadedWithExperiment && curExperiment?.notebookContent
              ? curExperiment.notebookContent
              : undefined
          }
          path={
            loadedWithExperiment && curExperiment?.notebookContent
              ? undefined
              : `${props.game.id}/test.ipynb`
          }
          uid={NOTEBOOK_UID}
        />
      </div>
      <ActionPopup
        open={Boolean(evaluationInput.length && evaluationOutput.length)}
        onClose={clearOutputs}
        title="See results"
        text="Would you like to view your results?"
      >
        <Button onClick={clearOutputs}>Cancel</Button>
        <TooltipMsg elemId="view-sim" dialogue={dialogue} placement="bottom">
          <Button onClick={toSimulation}>View Simulation</Button>
        </TooltipMsg>
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
        title={game.title}
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
  buttons: {
    display: "flex",
    flexDirection: "row",
    height: 40,
    width: "100%",
    overflowX: "scroll",
    whiteSpace: "nowrap",
  },
}));

export default NotebookComponent;
