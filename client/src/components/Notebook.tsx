/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from "react";
import { Notebook, Output } from "@datalayer/jupyter-react";
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
} from "@mui/icons-material";
import CodeEditor from "@uiw/react-textarea-code-editor";

import { Game } from "../games";
import { useWithNotebookModifications } from "../hooks/use-with-notebook-modifications";
import { useWithCellOutputs } from "../hooks/use-with-cell-outputs";
import { useWithWindowSize } from "../hooks/use-with-window-size";
import { GaiCellTypes, NOTEBOOK_UID } from "../local-constants";

function NotebookComponent(props: {
  game: Game;
  setExperiment: (e: number) => void;
  viewSummary: () => void;
  runSimulation: (i: number) => void;
}): JSX.Element {
  const classes = useStyles();
  const { height } = useWithWindowSize();
  const {
    cells,
    curCell,
    code,
    isCodeEdited,
    evaluationInput,
    evaluationOutput,
    evaluationCode,
    selectCell,
    run,
    editCode,
    saveCode,
    undoCode,
  } = useWithCellOutputs();
  useWithNotebookModifications({ greyOutUneditableBlocks: true });
  const [mode, setMode] = useState<"dark" | "light">("light");
  const [output, setOutput] = useState<JSX.Element>();

  useEffect(() => {
    if (output) {
      setOutput(undefined);
    } else if (cells[curCell]?.output?.length) {
      setOutput(<Output outputs={cells[curCell].output} />);
    }
  }, [curCell, cells]);

  useEffect(() => {
    if (!output && cells[curCell]?.output?.length) {
      setOutput(<Output outputs={cells[curCell].output} />);
    }
  }, [output]);

  function toSimulation(): void {
    props.game.simulator.simulate(
      evaluationInput,
      evaluationOutput,
      evaluationCode
    );
    props.setExperiment(props.game.simulator.experiments.length - 1);
    props.runSimulation(0);
  }

  function toSummary(): void {
    props.game.simulator.simulate(
      evaluationInput,
      evaluationOutput,
      evaluationCode
    );
    props.setExperiment(props.game.simulator.experiments.length - 1);
    props.viewSummary();
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <Select
            variant="standard"
            value={curCell as GaiCellTypes}
            onChange={(e) => selectCell(e.target.value as GaiCellTypes)}
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
          {curCell === GaiCellTypes.EVALUATION ? (
            <div>
              <IconButton disabled={!isCodeEdited} onClick={saveCode}>
                <Save />
              </IconButton>
              <IconButton disabled={!isCodeEdited} onClick={undoCode}>
                <Undo />
              </IconButton>
            </div>
          ) : undefined}
          <IconButton onClick={run}>
            <PlayArrow />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <CodeEditor
        className={classes.textEditor}
        value={
          curCell === GaiCellTypes.EVALUATION
            ? code
            : cells[curCell]?.cell.toJSON().source
        }
        language="python"
        data-color-mode={mode}
        disabled={curCell !== GaiCellTypes.EVALUATION}
        onChange={(evn) => editCode(evn.target.value)}
        padding={15}
      />
      <div
        style={{
          width: "100%",
          padding: 5,
          backgroundColor: mode === "dark" ? "#bbb" : "#f6f8fa",
        }}
      >
        {output}
      </div>
      <Toolbar
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          display:
            evaluationOutput.length && evaluationInput.length ? "flex" : "none",
        }}
      >
        <Button onClick={toSimulation}>View Simulation</Button>
        <Button onClick={toSummary}>View Summary</Button>
      </Toolbar>
      <div style={{ display: "none" }}>
        <Notebook
          path={`${props.game.id}/test.ipynb`}
          uid={NOTEBOOK_UID}
          height={`${height - 200}px`}
        />
      </div>
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
  textEditor: {
    width: "100%",
    flexGrow: 1,
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
}));

export default NotebookComponent;
