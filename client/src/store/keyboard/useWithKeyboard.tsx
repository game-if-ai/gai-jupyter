/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import { useEffect, useState } from "react";
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import { ICellModel } from "@jupyterlab/cells";

import { useAppDispatch, useAppSelector } from "../";
import { setKey, setOpen } from ".";

export interface ShortcutKey {
  text: string;
  key?: string;
  offset?: number;
}

export const SHORTCUT_KEYS: ShortcutKey[] = [
  { text: "TAB", key: "    ", offset: 4 },
  { text: "( )", key: "()" },
  { text: "[ ]", key: "[]" },
  { text: "{ }", key: "{}" },
  { text: '" "', key: '""' },
  { text: "' '", key: "''" },
  { text: ":" },
  { text: ";" },
  { text: "," },
  { text: "." },
  { text: "=" },
  { text: "+" },
  { text: "-" },
  { text: "<" },
  { text: ">" },
  { text: "#" },
  { text: "!" },
  { text: "?" },
];

export interface UseWithShortcutKeys {
  isMobile: boolean;
  isMobileKeyboardOpen: boolean;
  mobileKeyboardHeight: number;
  selectCell: (cell: ICellModel) => void;
  selectKey: (key: ShortcutKey | undefined) => void;
}

export function useWithShortcutKeys(): UseWithShortcutKeys {
  const [isMobile] = useState<boolean>(
    /Android|iPhone/i.test(navigator.userAgent)
  );
  const [height] = useState<number>(window?.visualViewport?.height || 0);
  const [mobileKeyboardHeight, setMobileKeyboardHeight] = useState<number>(0);
  const isMobileKeyboardOpen = useDetectKeyboardOpen();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isMobile) return;
    window.visualViewport!.addEventListener("resize", updateViewport);
    return () =>
      window.visualViewport!.removeEventListener("resize", updateViewport);
  }, [isMobile]);

  function updateViewport() {
    setMobileKeyboardHeight(height - window.visualViewport!.height);
  }

  function selectKey(key: ShortcutKey | undefined) {
    dispatch(setKey(key));
  }

  function selectCell(cell: ICellModel): void {
    if (cell.getMetadata("contenteditable") === false) {
      dispatch(setOpen(false));
    } else {
      dispatch(setOpen(true));
    }
  }

  return {
    isMobile,
    isMobileKeyboardOpen,
    mobileKeyboardHeight,
    selectKey,
    selectCell,
  };
}
