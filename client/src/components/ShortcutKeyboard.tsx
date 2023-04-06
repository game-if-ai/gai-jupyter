/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  SHORTCUT_KEYS,
  UseWithShortcutKeys,
} from "../hooks/use-with-shortcut-keys";

export function ShortcutKeyboard(props: {
  shortcutKeyboard: UseWithShortcutKeys;
}): JSX.Element {
  const classes = useStyles();
  const { shortcutKeyboard } = props;
  const [isMobile] = useState<boolean>(
    /Android|iPhone/i.test(navigator.userAgent)
  );
  const [height] = useState<number>(window.innerHeight);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  useEffect(() => {
    if (!isMobile) return;
    window.addEventListener("resize", resizeWindow);
    return () => window.removeEventListener("resize", resizeWindow);
  });

  function resizeWindow() {
    if (!isMobile) return;
    setKeyboardHeight(height - window.innerHeight);
  }

  return (
    <div
      className={classes.shortcutButtons}
      style={{
        display: shortcutKeyboard.isOpen ? "block" : "none",
        bottom: keyboardHeight,
      }}
    >
      {SHORTCUT_KEYS.map((s) => (
        <Button
          key={s.text}
          color="primary"
          onClick={() => shortcutKeyboard.setKey(s)}
          style={{
            maxWidth: "30px",
            minWidth: "30px",
            marginLeft: 5,
            marginRight: 5,
          }}
        >
          {s.text}
        </Button>
      ))}
    </div>
  );
}

const useStyles = makeStyles(() => ({
  shortcutButtons: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: 50,
    position: "relative",
    zIndex: 1,
    backgroundColor: "white",
    boxShadow: "10px 5px 5px black",
    overflowX: "scroll",
    whiteSpace: "nowrap",
  },
}));
