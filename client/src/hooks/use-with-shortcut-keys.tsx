/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { useState } from "react";
import useDetectKeyboardOpen from "use-detect-keyboard-open";

export interface UseWithShortcutKeys {
  key: string | undefined;
  isOpen: boolean;
  setFocused: (tf: boolean) => void;
  setKey: (k: string | undefined) => void;
}

export function useWithShortcutKeys(): UseWithShortcutKeys {
  const isKeyboardOpen = useDetectKeyboardOpen();
  const [focused, setFocused] = useState<boolean>(false);
  const [key, setKey] = useState<string>();

  return {
    key,
    isOpen: isKeyboardOpen || focused,
    setFocused,
    setKey,
  };
}

export interface ShortcutKey {
  text: string;
  key?: string;
}

export const SHORTCUT_KEYS: ShortcutKey[] = [
  { text: "TAB", key: "  " },
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
