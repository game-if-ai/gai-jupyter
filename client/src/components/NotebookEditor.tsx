/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from "react";
import { isError, IError } from "@jupyterlab/nbformat";
import { Button, Collapse, IconButton, Typography } from "@mui/material";
import {
  EditOff,
  HelpOutlineOutlined,
  Redo,
  Undo,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { minimalSetup, EditorView, basicSetup } from "codemirror";
import { CompletionContext, autocompletion } from "@codemirror/autocomplete";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";
import { linter, lintGutter, Diagnostic } from "@codemirror/lint";
import { Compartment, EditorState, StateEffect } from "@codemirror/state";
import {
  redo,
  undo,
  undoDepth,
  redoDepth,
  indentWithTab,
} from "@codemirror/commands";
import { keymap } from "@codemirror/view";

import { CellState } from "../hooks/use-with-notebook";
import { capitalizeFirst } from "../utils";
import { useWithDialogue } from "../store/dialogue/useWithDialogue";
import { UseWithImproveCode } from "../hooks/use-with-improve-code";
import { useAppSelector } from "../store";
import { useWithShortcutKeys } from "../store/keyboard/useWithKeyboard";
import { TooltipMsg } from "./Dialogue";
import { Output } from "./Output";

import "../codemirror.css";

interface CustomErrorMessage {
  condition: (errorOutput: IError) => boolean;
  message: string;
}

const customErrorMessages: CustomErrorMessage[] = [
  {
    condition: (errorOutput) => {
      return errorOutput.ename === "SyntaxError";
    },
    message:
      "Your code contains syntax errors. Please review your code and address these errors.",
  },
  {
    condition: (errorOutput) => {
      return errorOutput.ename === "ImportError";
    },
    message:
      "Your code contains import errors. This may be due to incorrect spelling or importing a library or module that does not exist.",
  },
  {
    condition: (errorOutput) => {
      return errorOutput.ename === "NameError";
    },
    message:
      "Your code contains a naming error. You may be trying to use an undeclared variable or function.",
  },
];

export function NotebookEditor(props: {
  cellState: CellState;
  hints: UseWithImproveCode;
  isSaving: boolean;
  editCode: (cell: string, code: string) => void;
}): JSX.Element {
  const classes = useStyles();
  const { cellState, hints, isSaving } = props;
  const { cell, output, errorOutput, lintOutput } = cellState;
  const cellId = cell.id;
  const [cellType] = useState(cell.getMetadata("gai_cell_type") || "");
  const [showOutput, setShowOutput] = useState<boolean>(cellType === "MODEL");
  const [outputElement, setOutputElement] = useState<JSX.Element>();
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [editor, setEditor] = useState<EditorView>();
  const [lintCompartment] = useState(new Compartment());
  const [hasError, setHasError] = useState<boolean>(false);

  const key = useAppSelector((s) => s.keyboard.key);
  const activity = useAppSelector((s) => s.state.activity!);
  const { selectCell, selectKey } = useWithShortcutKeys();
  const { addMessage } = useWithDialogue();

  function autocomplete(context: CompletionContext) {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return {
      from: word.from,
      options: activity.autocompletion,
    };
  }

  useEffect(() => {
    const doc = document.getElementById(`code-input-${cellId}`);
    if (!doc || editor) {
      return;
    }
    const isDisabled = cell.getMetadata("contenteditable") === false;
    setIsDisabled(isDisabled);
    const extensions = [
      python(), // python language
      keymap.of([indentWithTab]), // enable TAB key
      indentUnit.of("    "), // use 4 spaces for indents
      EditorState.readOnly.of(isDisabled), // disable editing
      EditorView.focusChangeEffect.of((_, focusing) => {
        // detect when cell clicked
        if (focusing) selectCell(cell);
        return StateEffect.define(undefined).of(null);
      }),
      lintCompartment.of(linter(() => [])),
      autocompletion({ optionClass: () => "autocompleteOption" }),
      isDisabled ? minimalSetup : basicSetup,
    ];
    if (!isDisabled) {
      extensions.push(lintGutter());
      extensions.push(
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            props.editCode(cellId, v.state.doc.toString());
          }
        })
      );
    }
    if (activity.autocompletion) {
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
  }, [cell]);

  useEffect(() => {
    if (isDisabled) {
      return;
    }
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
    if (!editor || !key || isDisabled) {
      return;
    }
    const cursor = editor.state.selection.ranges[0];
    const transaction = editor.state.update({
      changes: {
        from: cursor.from,
        to: cursor.to,
        insert: key.key || key.text,
      },
    });
    editor.dispatch(transaction);
    editor.dispatch({
      selection: { anchor: cursor.from + (key.offset || 1) },
    });
    selectKey(undefined);
  }, [key]);

  useEffect(() => {
    if (outputElement && !output.length) {
      setOutputElement(undefined);
      setHasError(false);
    } else if (output.length) {
      const o = output[0];
      if (o && isError(o)) {
        const customErrorMessage = customErrorMessages.find((customError) =>
          customError.condition(o)
        );
        addMessage({
          id: `output-${cellId}`,
          text:
            customErrorMessage?.message ||
            "There was an error while running this cell. Please review and make changes before re-running.",
          noSave: true,
          timer: 5000,
        });
        setHasError(true);
      } else {
        setHasError(false);
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
    if (isDisabled) return;
    editor?.dispatch({
      effects: lintCompartment.reconfigure(
        linter((view) => {
          let diagnostics: Diagnostic[] = [];
          const lintLines = lintOutput?.split("\n") || [];
          for (const l of lintLines) {
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
          if (errorOutput) {
            const traceback = errorOutput.traceback?.toString();
            let line;
            if (traceback?.indexOf("----> ") !== -1) {
              const lineNum = traceback!.split("----> ")[1].split(" ")[0];
              line = view.state.doc.line(Number.parseInt(lineNum));
            } else if (traceback?.indexOf(", line ") !== -1) {
              const lineNum = traceback!.split(", line ")[1].split(")")[0];
              line = view.state.doc.line(Number.parseInt(lineNum));
            }
            diagnostics.push({
              from: line?.from || 0,
              to: line?.to || 0,
              severity: "error",
              message: `${errorOutput.ename}: ${errorOutput.evalue}`,
            });
          }
          return diagnostics;
        })
      ),
    });
  }, [lintOutput, errorOutput]);

  return (
    <div
      data-cy="cell"
      id={`cell-${cellId}`}
      style={{
        backgroundColor: isDisabled ? "#E3E3E3" : "#FFFFFF",
      }}
    >
      <div className={classes.cellHeader}>
        {isDisabled ? (
          <EditOff fontSize="small" className={classes.noEditIcon} />
        ) : (
          <div>
            <IconButton
              data-cy="undo-btn"
              disabled={!editor || undoDepth(editor.state) === 0}
              onClick={() =>
                undo({
                  state: editor!.state,
                  dispatch: editor!.dispatch,
                })
              }
            >
              <Undo />
            </IconButton>
            <IconButton
              data-cy="redo-btn"
              disabled={!editor || redoDepth(editor.state) === 0}
              onClick={() =>
                redo({
                  state: editor!.state,
                  dispatch: editor!.dispatch,
                })
              }
            >
              <Redo />
            </IconButton>
          </div>
        )}
        <TooltipMsg elemId={`cell-${cellId}`}>
          <Typography data-elemid={`cell-${cellId}`}>
            {capitalizeFirst(cellType)}
          </Typography>
        </TooltipMsg>
        {isDisabled ? undefined : (
          <IconButton
            data-cy="hint-btn"
            disabled={!hints.hintsAvailable || isSaving}
            onClick={() => {
              hints.toastHint();
              // hintClickedCmi5(activity.id);
            }}
          >
            <HelpOutlineOutlined />
          </IconButton>
        )}
        <div style={{ flexGrow: 1 }} />
        <TooltipMsg elemId={`output-${cellId}`}>
          <Button
            data-cy="output-btn"
            data-test={showOutput || hasError}
            data-elemid={`output-${cellId}`}
            startIcon={
              showOutput || hasError ? <Visibility /> : <VisibilityOff />
            }
            onClick={() => setShowOutput(!showOutput)}
          >
            Output
          </Button>
        </TooltipMsg>
      </div>
      <div id={`code-input-${cellId}`} />
      <Collapse
        data-cy="output"
        in={showOutput || hasError}
        timeout={500}
        unmountOnExit
      >
        {outputElement}
      </Collapse>
    </div>
  );
}

const useStyles = makeStyles(() => ({
  cellHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    position: "sticky",
    backgroundColor: "inherit",
    paddingLeft: 10,
    paddingRight: 10,
    zIndex: 1,
    top: "0px",
  },
  noEditIcon: {
    marginRight: 5,
    color: "#a8a8a8",
  },
}));

export default NotebookEditor;
