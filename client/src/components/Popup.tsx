/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export function Popup(props: {
  open: boolean;
  title?: string;
  className?: string;
  onClose: () => void;
  actions?: JSX.Element;
  children?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}): JSX.Element {
  return (
    <Dialog
      className={props.className}
      onClose={props.onClose}
      open={props.open}
    >
      {props.title ? (
        <DialogTitle style={{ textAlign: "center" }}>{props.title}</DialogTitle>
      ) : undefined}
      <DialogContent>{props.children}</DialogContent>
      {props.actions ? (
        <DialogActions style={{ justifyContent: "center" }}>
          {props.actions}
        </DialogActions>
      ) : undefined}
    </Dialog>
  );
}

export function ActionPopup(props: {
  open: boolean;
  title?: string;
  text?: string;
  children?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onClose: () => void;
}): JSX.Element {
  return (
    <Popup
      data-cy="action-popup"
      open={props.open}
      onClose={props.onClose}
      title={props.title}
      actions={
        <DialogActions style={{ justifyContent: "center" }}>
          {props.children}
        </DialogActions>
      }
    >
      {props.text ? (
        <DialogContentText>{props.text}</DialogContentText>
      ) : undefined}
    </Popup>
  );
}
