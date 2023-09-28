/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export const ACCESS_TOKEN_KEY = "accessToken";
export const ACTIVE_MENTOR_KEY = "activeMentor";
export const UNIQUE_USER_ID_LS = "uniqueUserId";
export const EXPERIMENT_HISTORY = "@experimentHistory";
export const NOTEBOOK_HISTORY = "@notebookHistory";

export function localStorageGet(key: string): unknown | null {
  if (typeof window === "undefined") {
    return "";
  }
  const item = localStorage.getItem(key);
  if (!item) {
    return null;
  }
  try {
    return JSON.parse(item);
  } catch (err) {
    return item;
  }
}

export function localStorageStore(key: string, value: unknown): void {
  if (typeof window === "undefined") {
    return;
  }
  const val = typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, val);
}

export function localStorageClear(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(key);
}

export function sessionStorageGet(key: string): string | null {
  if (typeof window === "undefined") {
    return "";
  }
  return sessionStorage.getItem(key);
}

export function sessionStorageStore(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(key, value);
}

export function sessionStorageClear(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(key);
}
