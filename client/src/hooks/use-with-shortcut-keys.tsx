/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { useState } from "react";
import { ICellModel } from "@jupyterlab/cells";

export interface UseWithShortcutKeys {
  key: ShortcutKey | undefined;
  isOpen: boolean;
  setKey: (k: ShortcutKey | undefined) => void;
  setCell: (cell: ICellModel) => void;
}

export function useWithShortcutKeys(): UseWithShortcutKeys {
  const [key, setKey] = useState<ShortcutKey>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function setCell(cell: ICellModel): void {
    if (cell.getMetadata("contenteditable") === false) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }

  return {
    key,
    isOpen,
    setKey,
    setCell,
  };
}

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
