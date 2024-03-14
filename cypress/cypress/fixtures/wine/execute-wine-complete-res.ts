/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CodeExecutorResponseData } from "../support/types";

export const executeWineRes: CodeExecutorResponseData = {
  id: "123",
  status: "SUCCESS",
  state: "SUCCESS",
  result: [
    "{}",
    '",quality,N\\n2,5.308,321\\n4,5.333,273\\n5,5.451,215\\n1,5.636,338\\n0,5.888,214\\n3,6.366,238\\n"',
  ],
  console: "",
  statusUrl: "/execute/status/321",
};
