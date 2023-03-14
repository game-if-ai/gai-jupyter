/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useRef, useState } from "react";
import { Notebook, Output, selectNotebook } from "@datalayer/jupyter-react";
import {
  AppBar,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  DarkMode,
  EditOff,
  LightMode,
  PlayArrow,
  Save,
  Undo,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import CodeEditor from "@uiw/react-textarea-code-editor";

import { Game } from "../games";
import { Experiment, Simulation } from "../games/simulator";
import { CellState, useWithCellOutputs } from "../hooks/use-with-cell-outputs";
import { useWithWindowSize } from "../hooks/use-with-window-size";
import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";

function NotebookCell(props: {
  cellType: string;
  cellState: CellState;
  mode: "dark" | "light";
  code: string | string[];
  editCode: (s: string) => void;
  setCurCell: (s: string) => void;
}): JSX.Element {
  const classes = useStyles();
  const { mode, cellType, cellState } = props;
  const { cell, output } = cellState;
  const [showOutput, setShowOutput] = useState<boolean>(true);
  const [outputElement, setOutputElement] = useState<JSX.Element>();
  const [topVisible, setTopVisible] = useState<boolean>(false);
  const [botVisible, setBotVisible] = useState<boolean>(false);
  const isDisabled = cell.getMetadata("contenteditable") === false;
  const refTop = useRef<HTMLDivElement>(null);
  const refBot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!refTop.current || !refBot.current) {
      return;
    }
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((e) => {
        const attr = e.target.getAttribute("cy-data");
        if (attr === "top") {
          setTopVisible(e.isIntersecting);
        } else if (attr === "bottom") {
          setBotVisible(e.isIntersecting);
        }
      });
    });
    observer.observe(refTop.current);
    observer.observe(refBot.current);
    return () => {
      observer.disconnect();
    };
  }, [refTop.current, refBot.current]);

  useEffect(() => {
    if (topVisible && botVisible) {
      props.setCurCell(cellType);
    }
  }, [topVisible, botVisible]);

  useEffect(() => {
    if (outputElement) {
      setOutputElement(undefined);
    } else if (output.length) {
      setOutputElement(<Output outputs={output} />);
    }
  }, [output]);

  useEffect(() => {
    if (!outputElement && output.length) {
      setOutputElement(<Output outputs={output} />);
    }
  }, [outputElement]);

  return (
    <div
      id={`cell-${cellType}`}
      style={{
        color: mode === "dark" ? "white" : "",
        backgroundColor:
          mode === "dark"
            ? isDisabled
              ? "#232323"
              : "#171a22"
            : isDisabled
            ? "#E3E3E3"
            : "#f6f8fa",
      }}
    >
      <div cy-data="top" ref={refTop} />
      <div className={classes.cellHeader}>
        {isDisabled ? (
          <EditOff fontSize="small" className={classes.noEditIcon} />
        ) : undefined}
        <Typography>{cellType.toLowerCase()}</Typography>
        <div style={{ flexGrow: 1 }} />
        <Button
          startIcon={showOutput ? <Visibility /> : <VisibilityOff />}
          onClick={() => setShowOutput(!showOutput)}
        >
          Output
        </Button>
      </div>
      <CodeEditor
        id={!isDisabled ? "code-input" : ""}
        className={classes.textEditor}
        language="python"
        data-color-mode={mode}
        value={
          cellType === GaiCellTypes.EVALUATION
            ? props.code
            : cell.toJSON().source
        }
        style={{ backgroundColor: "inherit" }}
        onChange={(evn) => props.editCode(evn.target.value)}
        disabled={isDisabled}
      />
      <Collapse in={showOutput} timeout="auto" unmountOnExit>
        {outputElement}
      </Collapse>
      <div cy-data="bottom" ref={refBot} />
    </div>
  );
}

function NotebookComponent(props: {
  game: Game;
  curExperiment: Experiment<Simulation> | undefined;
  setExperiment: (e: number) => void;
  viewSummary: () => void;
  runSimulation: (i: number) => void;
}): JSX.Element {
  const classes = useStyles();
  const { height } = useWithWindowSize();
  const { game, curExperiment } = props;
  const {
    cells,
    curCell,
    code,
    isCodeEdited,
    evaluationInput,
    evaluationOutput,
    evaluationCode,
    run,
    clear,
    editCode,
    saveCode,
    undoCode,
    setCurCell,
  } = useWithCellOutputs();
  const notebook = selectNotebook(NOTEBOOK_UID);
  const [mode, setMode] = useState<"dark" | "light">("light");
  const [dialogUnsaved, setDialogUnsaved] = useState<boolean>(false);
  const [outputSimulated, setOutputSimulated] = useState(true);
  const [loadedWithExperiment] = useState(Boolean(curExperiment)); //only evaluates when component first loads

  useEffect(() => {
    if (evaluationOutput && evaluationOutput.length && !outputSimulated) {
      setOutputSimulated(true);
    }
  }, [evaluationOutput]);

  function toSimulation(): void {
    game.simulator.simulate(
      evaluationInput,
      evaluationOutput,
      evaluationCode,
      notebook
    );
    props.setExperiment(game.simulator.experiments.length - 1);
    props.runSimulation(0);
  }

  function toSummary(): void {
    game.simulator.simulate(
      evaluationInput,
      evaluationOutput,
      evaluationCode,
      notebook
    );
    props.setExperiment(game.simulator.experiments.length - 1);
    props.viewSummary();
  }

  function simulate(): void {
    if (isCodeEdited) {
      setDialogUnsaved(true);
    } else {
      setOutputSimulated(false);
      run();
    }
  }

  function ShortcutKey(str: string, key: string): JSX.Element {
    return (
      <Button
        key={str}
        onClick={(e) => {
          e.preventDefault();
          const c = code as string;
          const element = document.getElementById(
            "code-input"
          ) as HTMLTextAreaElement;
          const cursorPosition = element.selectionStart;
          const textBeforeCursor = c.substring(0, cursorPosition);
          const textAfterCursor = c.substring(cursorPosition, c.length);
          editCode(textBeforeCursor + key + textAfterCursor);
          new Promise((res) => setTimeout(res, 100)).then(() => {
            element.selectionStart = cursorPosition + 1;
          });
        }}
      >
        {str}
      </Button>
    );
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <Select
            variant="standard"
            value={curCell}
            onChange={(e) => {
              document
                .getElementById(`cell-${e.target.value}`)
                ?.scrollIntoView();
              setCurCell(e.target.value);
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
          <IconButton disabled={!isCodeEdited} onClick={saveCode}>
            <Save />
          </IconButton>
          <IconButton disabled={!isCodeEdited} onClick={undoCode}>
            <Undo />
          </IconButton>
          <IconButton onClick={simulate}>
            <PlayArrow />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <div className={classes.cells} style={{ height: height - 100 }}>
        {Object.entries(cells).map((v) => (
          <NotebookCell
            key={v[0]}
            cellType={v[0]}
            cellState={v[1]}
            mode={mode}
            code={code}
            editCode={editCode}
            setCurCell={setCurCell}
          />
        ))}
      </div>
      <div
        className={classes.buttons}
        style={{ backgroundColor: mode === "dark" ? "#171a22" : "#f6f8fa" }}
      >
        {SHORTCUT_KEYS.map((s) => ShortcutKey(s.text, s.key || s.text))}
      </div>
      <div style={{ display: "none" }}>
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
      <Dialog
        onClose={clear}
        open={Boolean(evaluationInput.length && evaluationOutput.length)}
      >
        <DialogTitle>Code Run</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to view your results?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={clear}>Cancel</Button>
          <Button onClick={toSimulation}>View Simulation</Button>
          <Button onClick={toSummary}>View Summary</Button>
        </DialogActions>
      </Dialog>
      <Dialog onClose={() => setDialogUnsaved(false)} open={dialogUnsaved}>
        <DialogTitle>Unsaved Code Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to run without saving?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogUnsaved(false)}>Cancel</Button>
          <Button
            onClick={() => {
              run();
              setDialogUnsaved(false);
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

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
    flexGrow: 1,
    overflowY: "scroll",
  },
  cellHeader: {
    display: "flex",
    flexDirection: "row",
    marginLeft: 10,
    marginRight: 10,
    borderBottomWidth: 1,
    borderBottomStyle: "dotted",
    alignItems: "center",
  },
  textEditor: {
    fontSize: 12,
    fontFamily:
      "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
  },
  switchIcon: {
    width: 16,
    height: 16,
    padding: 2,
    borderRadius: 16,
    backgroundColor: "white",
    color: "red",
  },
  noEditIcon: {
    marginRight: 5,
    color: "#a8a8a8",
  },
  buttons: {
    flexDirection: "row",
    width: "100%",
    overflowX: "scroll",
    whiteSpace: "nowrap",
  },
}));

interface ShortcutKey {
  text: string;
  key?: string;
}
const SHORTCUT_KEYS: ShortcutKey[] = [
  { text: "TAB", key: "    " },
  { text: "(" },
  { text: ")" },
  { text: "[" },
  { text: "]" },
  { text: "=" },
  { text: ":" },
  { text: ";" },
  { text: "," },
  { text: "." },
  { text: '"' },
  { text: "'" },
  { text: "!" },
  { text: "?" },
  { text: "+" },
  { text: "-" },
  { text: "<" },
  { text: ">" },
  { text: "#" },
];

export default NotebookComponent;
