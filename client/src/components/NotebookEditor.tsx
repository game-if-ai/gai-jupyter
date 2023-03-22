/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import {
  Notebook,
  Output,
  selectNotebook,
  selectNotebookModel,
} from "@datalayer/jupyter-react";
import { INotebookContent, IOutput } from "@jupyterlab/nbformat";
import { Button, Collapse, IconButton, Typography } from "@mui/material";
import { EditOff, Undo, Visibility, VisibilityOff } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { basicSetup, EditorView } from "codemirror";
import { CompletionContext } from "@codemirror/autocomplete";
import { linter, lintGutter, Diagnostic } from "@codemirror/lint";
import { python } from "@codemirror/lang-python";
import { Compartment, EditorState, StateEffect } from "@codemirror/state";

import { Game } from "../games";
import { CellState } from "../hooks/use-with-notebook";
import { UseWithDialogue } from "../hooks/use-with-dialogue";
import { UseWithShortcutKeys } from "../hooks/use-with-shortcut-keys";
import { TooltipMsg } from "./Dialogue";

export function NotebookEditor(props: {
  mode: "dark" | "light";
  game: Game;
  cellType: string;
  cellState: CellState;
  dialogue: UseWithDialogue;
  shortcutKeyboard: UseWithShortcutKeys;
  editCode: (cell: string, code: string) => void;
}): JSX.Element {
  const classes = useStyles();
  const { mode, cellType, cellState, dialogue, shortcutKeyboard } = props;
  const { cell, output } = cellState;
  const [showOutput, setShowOutput] = useState<boolean>(true);
  const [outputElement, setOutputElement] = useState<JSX.Element>();
  const [editor, setEditor] = useState<EditorView>();
  const isDisabled = cell.getMetadata("contenteditable") === false;
  const isEdited = cell.toJSON().source !== cellState.code;

  const notebook = selectNotebook(cellType);
  const activeNotebookModel = selectNotebookModel(cellType);
  const [model, setModel] = useState<INotebookContent>();
  const [lintOutput, setLintOutput] = useState<string>("");
  const [lintCompartment] = useState(new Compartment());

  function autocomplete(context: CompletionContext) {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from == word.to && !context.explicit)) return null;
    return {
      from: word.from,
      options: props.game.autocompletion,
    };
  }

  function undo(): void {
    if (!editor) {
      return;
    }
    const transaction = editor.state.update({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: cell.toJSON().source as string,
      },
    });
    editor.dispatch(transaction);
  }

  useEffect(() => {
    const doc = document.getElementById(`code-input-${cellType}`);
    if (!doc || editor) {
      return;
    }
    const extensions = [
      basicSetup,
      python(),
      lintGutter(),
      EditorState.tabSize.of(4),
      EditorState.readOnly.of(isDisabled),
      lintCompartment.of(linter(() => [])),
    ];
    if (!isDisabled) {
      extensions.push(
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            props.editCode(cellType, v.state.doc.toString());
          }
        })
      );
      extensions.push(
        EditorView.focusChangeEffect.of((_, focusing) => {
          props.shortcutKeyboard.setFocused(focusing);
          return StateEffect.define(undefined).of(null);
        })
      );
    }
    if (props.game.autocompletion) {
      extensions.push(
        python().language.data.of({
          autocomplete: autocomplete,
        })
      );
    }
    setEditor(
      new EditorView({
        state: EditorState.create({
          doc: cell.toJSON().source as string,
          extensions,
        }),
        parent: doc,
      })
    );
  }, []);

  useEffect(() => {
    if (isDisabled) {
      return;
    }
    setModel({
      cells: [
        {
          source: `%%pycodestyle\n${cellState.code}`,
          cell_type: "code",
          metadata: { trusted: true, editable: false, deletable: false },
          outputs: [],
          execution_count: 0,
        },
        {
          source: cellState.code,
          cell_type: "code",
          metadata: { trusted: true, editable: false, deletable: false },
          outputs: [],
          execution_count: 0,
        },
      ],
      metadata: {},
      nbformat_minor: 1,
      nbformat: 1,
    });
    if (cellState.code !== editor?.state.doc.toJSON().join("\n")) {
      editor?.dispatch(
        editor.state.update({
          changes: {
            from: 0,
            to: editor.state.doc.length,
            insert: cellState.code as string,
          },
        })
      );
    }
  }, [cellState.code]);

  useEffect(() => {
    if (!editor || !shortcutKeyboard.key || isDisabled) {
      return;
    }
    const cursor = editor.state.selection.ranges[0];
    const transaction = editor.state.update({
      changes: {
        from: cursor.from,
        to: cursor.to,
        insert: shortcutKeyboard.key,
      },
    });
    editor.dispatch(transaction);
    editor.dispatch({
      selection: { anchor: cursor.from + shortcutKeyboard.key.length },
    });
    shortcutKeyboard.setKey(undefined);
  }, [shortcutKeyboard.key]);

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

  useEffect(() => {
    if (isDisabled || !activeNotebookModel?.model?.cells) {
      return;
    }
    const notebookCells = activeNotebookModel.model.cells;
    notebookCells.get(0).stateChanged.connect((changedCell) => {
      const o = changedCell.toJSON().outputs as IOutput[];
      if (o.length > 0) {
        setLintOutput(o[0].text as string);
      }
    });
    notebook?.adapter?.commands.execute("notebook:run-all");
  }, [model]);

  useEffect(() => {
    if (isDisabled) return;
    editor?.dispatch({
      effects: lintCompartment.reconfigure(
        linter((view) => {
          let diagnostics: Diagnostic[] = [];
          const lintLines = lintOutput.split("\n");
          for (const l of lintLines) {
            console.log(l);
            const start = l.split(":")[0];
            if (!start) continue;
            if (view.state.doc.lines < Number.parseInt(start) - 1) continue;
            const line = view.state.doc.line(Number.parseInt(start) - 1);
            diagnostics.push({
              from: line.from,
              to: line.to,
              severity: "warning",
              message: l,
            });
          }
          return diagnostics;
        })
      ),
    });
  }, [lintOutput]);

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
      <div className={classes.cellHeader}>
        {isDisabled ? (
          <EditOff fontSize="small" className={classes.noEditIcon} />
        ) : undefined}
        <TooltipMsg elemId={`cell-${cellType}`} dialogue={dialogue}>
          <Typography data-elemid={`cell-${cellType}`}>
            {cellType.toLowerCase()}
          </Typography>
        </TooltipMsg>
        <div style={{ flexGrow: 1 }} />
        {isDisabled ? undefined : (
          <IconButton disabled={!isEdited} onClick={undo}>
            <Undo />
          </IconButton>
        )}
        <TooltipMsg elemId={`output-${cellType}`} dialogue={dialogue}>
          <Button
            data-elemid={`output-${cellType}`}
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
      {isDisabled ? undefined : (
        <div style={{ display: "none" }}>
          <Notebook uid={cellType} model={model} />
        </div>
      )}
    </div>
  );
}

const useStyles = makeStyles(() => ({
  cellHeader: {
    display: "flex",
    flexDirection: "row",
    marginLeft: 10,
    marginRight: 10,
    alignItems: "center",
  },
  noEditIcon: {
    marginRight: 5,
    color: "#a8a8a8",
  },
}));

export default NotebookEditor;
