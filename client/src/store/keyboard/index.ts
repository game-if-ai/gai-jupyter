/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShortcutKey } from "./useWithKeyboard";

export interface KeyboardState {
  key: ShortcutKey | undefined;
  isOpen: boolean;
}

const initialState: KeyboardState = {
  key: undefined,
  isOpen: false,
};

export const keyboardSlice = createSlice({
  name: "keyboard",
  initialState,
  reducers: {
    setKey: (
      state: KeyboardState,
      action: PayloadAction<ShortcutKey | undefined>
    ) => {
      state.key = action.payload;
    },
    setOpen: (state: KeyboardState, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { setKey, setOpen } = keyboardSlice.actions;

export default keyboardSlice.reducer;
