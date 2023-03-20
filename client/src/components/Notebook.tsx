/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useRef, useState } from "react";
import {
  CodeMirrorEditor,
  Notebook,
  Output,
  selectNotebook,
} from "@datalayer/jupyter-react";
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
import { basicSetup, EditorView } from "codemirror";
import { python } from "@codemirror/lang-python";
import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";

import { Game } from "../games";
import { Experiment, Simulation } from "../games/simulator";
import { CellState, useWithCellOutputs } from "../hooks/use-with-cell-outputs";
import { UseWithDialogue, useWithDialogue } from "../hooks/use-with-dialogue";
import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";
import { TooltipMsg } from "./Dialogue";

function NotebookCell(props: {
  game: Game;
  curCell: string;
  cellType: string;
  cellState: CellState;
  mode: "dark" | "light";
  dialogue: UseWithDialogue;
  editCode: (c: string) => void;
  setCurCell: (s: string) => void;
  setEditor: (e: EditorView) => void;
}): JSX.Element {
  const classes = useStyles();
  const { mode, cellType, cellState, dialogue } = props;
  const { cell, output } = cellState;
  const [showOutput, setShowOutput] = useState<boolean>(true);
  const [outputElement, setOutputElement] = useState<JSX.Element>();
  const [editor, setEditor] = useState<EditorView>();
  const [topVisible, setTopVisible] = useState<boolean>(false);
  const [botVisible, setBotVisible] = useState<boolean>(false);
  const isDisabled = cell.getMetadata("contenteditable") === false;
  const refTop = useRef<HTMLDivElement>(null);
  const refBot = useRef<HTMLDivElement>(null);

  function myCompletions(context: CompletionContext) {
    let word = context.matchBefore(/\w*/);
    if (!word) {
      return;
    }
    if (word.from == word.to && !context.explicit) return null;
    return {
      from: word.from,
      options: props.game.autocompletion,
    };
  }

  useEffect(() => {
    const doc = document.getElementById(`code-input-${cellType}`);
    if (!doc || editor) {
      return;
    }
    const extensions = [basicSetup, python(), EditorState.tabSize.of(4)];
    if (isDisabled) {
      extensions.push(EditorState.readOnly.of(true));
    }
    if (props.game.autocompletion) {
      extensions.push(
        python().language.data.of({
          autocomplete: myCompletions,
        })
      );
    }
    const isEvalCell = cellType === GaiCellTypes.EVALUATION;
    if (isEvalCell) {
      extensions.push(
        EditorView.updateListener.of((v: ViewUpdate) => {
          if (v.docChanged) {
            props.editCode(v.state.doc.toString());
          }
        })
      );
    }
    const state = EditorState.create({
      doc: cell.toJSON().source as string,
      extensions,
    });
    const view = new EditorView({
      state,
      parent: doc,
    });
    setEditor(view);
    if (isEvalCell) {
      props.setEditor(view);
    }
  }, []);

  useEffect(() => {
    if (!refTop.current || !refBot.current) {
      return;
    }
    const observer = new IntersectionObserver((entries, observer) => {
      for (const e of entries) {
        if (e.target.getAttribute("data-cy") === "top") {
          setTopVisible(e.isIntersecting);
        } else if (e.target.getAttribute("data-cy") === "bot") {
          setBotVisible(e.isIntersecting);
        }
      }
    });
    observer.observe(refTop.current);
    observer.observe(refBot.current);
    return () => {
      observer.disconnect();
    };
  }, [refTop.current, refBot.current]);

  useEffect(() => {
    if (topVisible && botVisible && props.curCell) {
      props.setCurCell(cellType);
    }
  }, [topVisible, botVisible]);

  useEffect(() => {
    if (outputElement) {
      setOutputElement(undefined);
    } else if (output.length) {
      const o = output[0];
      if (o.traceback) {
        dialogue.addMessage({
          id: `output-${cellType}`,
          text: "There was an error while running this cell. Please review and make changes before re-running.",
          noSave: true,
        });
      }
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
      <div data-cy="top" ref={refTop} />
      <div className={classes.cellHeader}>
        {isDisabled ? (
          <EditOff fontSize="small" className={classes.noEditIcon} />
        ) : undefined}
        <TooltipMsg elemId={`cell-${cellType}`} dialogue={dialogue}>
          <Typography>{cellType.toLowerCase()}</Typography>
        </TooltipMsg>
        <div style={{ flexGrow: 1 }} />
        <TooltipMsg elemId={`output-${cellType}`} dialogue={dialogue}>
          <Button
            startIcon={showOutput ? <Visibility /> : <VisibilityOff />}
            onClick={() => setShowOutput(!showOutput)}
          >
            Output
          </Button>
        </TooltipMsg>
      </div>
      <div id={`code-input-${cellType}`} />
      <Collapse in={showOutput} timeout="auto" unmountOnExit>
        {outputElement}
      </Collapse>
      <div data-cy="bot" ref={refBot} style={{ marginBottom: 1 }} />
    </div>
  );
}

function NotebookComponent(props: {
  game: Game;
  curExperiment: Experiment<Simulation> | undefined;
  sawTutorial: boolean;
  setExperiment: (e: number) => void;
  viewSummary: () => void;
  runSimulation: (i: number) => void;
}): JSX.Element {
  const classes = useStyles();
  const { game, curExperiment } = props;
  const {
    cells,
    curCell,
    isCodeEdited,
    evaluationInput,
    evaluationOutput,
    evaluationCode,
    run,
    clear,
    editCode,
    saveCode,
    setCurCell,
  } = useWithCellOutputs();
  const dialogue = useWithDialogue();
  const notebook = selectNotebook(NOTEBOOK_UID);
  const [mode, setMode] = useState<"dark" | "light">("light");
  const [dialogUnsaved, setDialogUnsaved] = useState<boolean>(false);
  const [dialogDescription, setDialogDescription] = useState<boolean>(
    !props.sawTutorial
  );
  const [editor, setEditor] = useState<EditorView>();
  const [outputSimulated, setOutputSimulated] = useState(true);
  const [loadedWithExperiment] = useState(Boolean(curExperiment)); //only evaluates when component first loads

  useEffect(() => {
    if (evaluationOutput && evaluationOutput.length && !outputSimulated) {
      setOutputSimulated(true);
    }
  }, [evaluationOutput]);

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

  useEffect(() => {
    if (!dialogDescription && !curCell) {
      setCurCell(GaiCellTypes.EVALUATION);
      document
        .getElementById(`cell-${GaiCellTypes.EVALUATION}`)
        ?.scrollIntoView();
      if (!props.sawTutorial) {
        dialogue.addMessages([
          {
            id: `cell-${GaiCellTypes.EVALUATION}`,
            title: "Model Evaluation",
            text: "This is the evaluation cell. It has been filled in with stub code. Please edit it then run.",
          },
          {
            id: "run",
            title: "Run Code",
            text: "This is the run button. Press it after you've filled in the code to run the code and view simulated output.",
          },
        ]);
      }
    }
  }, [dialogDescription]);

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

  function undo(): void {
    if (!editor) {
      return;
    }
    const transaction = editor.state.update({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: evaluationCode as string,
      },
    });
    editor.dispatch(transaction);
  }

  function ShortcutKey(str: string, key: string): JSX.Element {
    return (
      <Button
        key={str}
        onClick={(e) => {
          if (!editor) {
            return;
          }
          const cursor = editor.state.selection.ranges[0];
          const transaction = editor.state.update({
            changes: { from: cursor.from, to: cursor.to, insert: key },
          });
          editor.dispatch(transaction);
          editor.dispatch({ selection: { anchor: cursor.from + 1 } });
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
          <TooltipMsg elemId="save" dialogue={dialogue}>
            <IconButton disabled={!isCodeEdited} onClick={saveCode}>
              <Save />
            </IconButton>
          </TooltipMsg>
          <IconButton disabled={!isCodeEdited} onClick={undo}>
            <Undo />
          </IconButton>
          <TooltipMsg elemId="run" dialogue={dialogue}>
            <IconButton onClick={simulate}>
              <PlayArrow />
            </IconButton>
          </TooltipMsg>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Button
        sx={{ textTransform: "none" }}
        onClick={() => setDialogDescription(true)}
      >
        Build a sentiment classifier model.
      </Button>
      <div className={classes.cells}>
        {Object.entries(cells).map((v) => (
          <NotebookCell
            key={v[0]}
            game={game}
            curCell={curCell}
            cellType={v[0]}
            cellState={v[1]}
            mode={mode}
            editCode={editCode}
            setCurCell={setCurCell}
            setEditor={setEditor}
            dialogue={dialogue}
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
        <DialogTitle>See results</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to view your results?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={clear}>Cancel</Button>
          <TooltipMsg elemId="view-sim" dialogue={dialogue} placement="top">
            <Button onClick={toSimulation}>View Simulation</Button>
          </TooltipMsg>
          <TooltipMsg elemId="view-summary" dialogue={dialogue} placement="top">
            <Button onClick={toSummary}>View Summary</Button>
          </TooltipMsg>
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
          <Button
            onClick={() => {
              dialogue.addMessage({
                id: "save",
                text: "Don't forget to save your changes before running again!",
                noSave: true,
              });
              setDialogUnsaved(false);
            }}
          >
            Cancel
          </Button>
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
      <Dialog
        onClose={() => setDialogDescription(false)}
        open={dialogDescription}
      >
        <DialogTitle>{game.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{game.description}</DialogContentText>
          <DialogContentText>
            Please complete this notebook to build a sentiment classifier. You
            will receive hints on how to improve its performance as you go.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogDescription(false)}>Okay</Button>
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
    flex: 1,
    overflowY: "scroll",
  },
  cellHeader: {
    display: "flex",
    flexDirection: "row",
    marginLeft: 10,
    marginRight: 10,
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
