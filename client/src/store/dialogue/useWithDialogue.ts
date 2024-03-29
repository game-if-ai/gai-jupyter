/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { useAppDispatch, useAppSelector } from "../";
import { setCurMessage, setMessages } from ".";
import { copyAndRemove } from "../../utils";

export interface DialogueMessage {
  id: string;
  text: string;
  title?: string;
  noSave?: boolean;
  timer?: number; // dismisses itself after x seconds
}

export interface UseWithDialogue {
  messages: DialogueMessage[];
  curMessage: DialogueMessage | undefined;
  addMessage: (msg: DialogueMessage, onlyMessage?: boolean) => void;
  addMessages: (msg: DialogueMessage[]) => void;
  nextMessage: () => void;
  clearMessages: () => void;
}

/**
 * Unfortunately we can't use redux because redux doesn't work with Jupyter-React...
 * Jupyter-React has its own redux store that will override it
 */
export function useWithDialogue(): UseWithDialogue {
  const messages = useAppSelector((s) => s.dialogue.messages);
  const curMessage = useAppSelector((s) => s.dialogue.curMessage);
  const dispatch = useAppDispatch();

  function addMessage(msg: DialogueMessage, onlyMessage?: boolean): void {
    if (onlyMessage) {
      dispatch(setMessages([]));
      dispatch(setCurMessage(msg));
      return;
    }
    if (messages.length === 0 && !curMessage) {
      dispatch(setCurMessage(msg));
    } else {
      dispatch(setMessages([...messages, msg]));
    }
  }

  function addMessages(msgs: DialogueMessage[]): void {
    if (messages.length === 0) {
      if (!curMessage) {
        dispatch(setCurMessage(msgs.shift()));
      }
      dispatch(setMessages([...msgs]));
    } else {
      dispatch(setMessages([...messages, ...msgs]));
    }
  }

  function nextMessage(): void {
    if (messages.length === 0) {
      if (curMessage) {
        dispatch(setCurMessage(undefined));
      }
    } else {
      const msg = messages[0];
      dispatch(setMessages(copyAndRemove(messages, 0)));
      dispatch(setCurMessage(msg));
    }
  }

  function clearMessages(): void {
    dispatch(setMessages([]));
    dispatch(setCurMessage(undefined));
  }

  return {
    messages,
    curMessage,
    addMessage,
    addMessages,
    nextMessage,
    clearMessages,
  };
}
