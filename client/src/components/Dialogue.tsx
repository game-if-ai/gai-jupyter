/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { withStyles } from "tss-react/mui";
import { DialogueMessage, UseWithDialogue } from "../hooks/use-with-dialogue";
import { useInterval } from "../hooks/use-interval";

export const ColorTooltip = withStyles(Tooltip, {
  tooltip: {
    backgroundColor: "secondary",
  },
});

export function TooltipMsg(props: {
  elemId: string;
  dialogue: UseWithDialogue;
  children?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  placement?:
    | "bottom"
    | "left"
    | "right"
    | "top"
    | "bottom-end"
    | "bottom-start"
    | "left-end"
    | "left-start"
    | "right-end"
    | "right-start"
    | "top-end"
    | "top-start";
}): JSX.Element {
  const { elemId } = props;
  const { curMessage, nextMessage } = props.dialogue;
  const [open, setOpen] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<DialogueMessage>();
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    if (!curMessage) {
      setOpen(false);
    } else {
      setOpen(curMessage.id === elemId);
      if (curMessage.id === elemId && !curMessage.noSave) {
        setLastMessage(curMessage);
      }
    }
  }, [curMessage]);

  useEffect(() => {
    if (open && curMessage && curMessage.id === elemId) {
      document.querySelector(`[data-elemid="${elemId}"]`)?.scrollIntoView();
    }
  }, [open]);

  useEffect(() => {
    if (open && curMessage?.id === elemId && curMessage.timer) {
      setTimer(curMessage.timer || 0);
    }
  }, [open, curMessage]);

  useInterval(
    (isCancelled) => {
      if (isCancelled()) {
        return;
      }
      if (timer <= 500) {
        close();
      }
      setTimer(timer - 500);
    },
    timer > 0 ? 500 : null
  );

  function close(): void {
    if (curMessage && curMessage.id === elemId) {
      nextMessage();
    } else {
      setOpen(false);
    }
  }

  const isCurMsg = curMessage?.id === elemId;
  return (
    <ColorTooltip
      open={open}
      placement={props.placement}
      disableHoverListener={open}
      onClose={close}
      onMouseEnter={() => {
        if (!open && lastMessage) {
          setOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (curMessage?.id !== elemId) {
          setOpen(false);
        }
      }}
      arrow
      leaveTouchDelay={isCurMsg ? curMessage?.timer : lastMessage?.timer}
      title={
        <div>
          <IconButton
            color="inherit"
            size="small"
            text-align="right"
            align-content="right"
            onClick={close}
          >
            <Close />
          </IconButton>
          <Typography color="inherit" align="center">
            {isCurMsg ? curMessage?.title : lastMessage?.title}
          </Typography>
          <p style={{ textAlign: "center" }}>
            {isCurMsg ? curMessage?.text : lastMessage?.text}
          </p>
        </div>
      }
      PopperProps={{
        style: { maxWidth: 250, textAlign: "right" },
      }}
    >
      {props.children}
    </ColorTooltip>
  );
}
