/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useContext, useEffect } from "react";
import { ReactReduxContext } from "react-redux";

import { useAppSelector } from ".";
import stateReducer from "./state";
import notebookReducer from "./notebook";
import simulatorReducer from "./simulator";
import keyboardReducer from "./keyboard";
import dialogueReducer from "./dialogue";
import { injectAsyncReducer } from "./reducers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WithRedux(props: { children: any }): JSX.Element {
  const { store } = useContext(ReactReduxContext);
  const state = useAppSelector((s) => s.state);
  const notebook = useAppSelector((s) => s.notebook);
  const simulator = useAppSelector((s) => s.simulator);
  const keyboard = useAppSelector((s) => s.keyboard);
  const dialogue = useAppSelector((s) => s.dialogue);

  /**
   * Jupyter-React hi-jacks the redux store
   * So we have to add our own reducers to it programmatically
   */
  useEffect(() => {
    injectAsyncReducer(store, "state", stateReducer);
    injectAsyncReducer(store, "notebook", notebookReducer);
    injectAsyncReducer(store, "simulator", simulatorReducer);
    injectAsyncReducer(store, "keyboard", keyboardReducer);
    injectAsyncReducer(store, "dialogue", dialogueReducer);
  });

  if (!state || !notebook || !simulator || !keyboard || !dialogue)
    return <div />;
  return props.children;
}

export default WithRedux;
