/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { TableContainer, Paper, TableBody } from "@mui/material";
import React from "react";
import { NNSimulationOutput } from "./simulator";

export function Summary(props: {
  simulation: NNSimulationOutput;
}): JSX.Element {
  const simulation = props.simulation;
  console.log(simulation);
  return (
    <TableContainer
      component={Paper}
      style={{
        width: "fit-content",
        padding: 20,
      }}
    >
      <TableBody>
        {/* <TableRow>
          <TableCell align="center">Accuracy</TableCell>
          <TableCell align="center">{round(simulation.accuracy)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="center">Precision</TableCell>
          <TableCell align="center">{round(simulation.precision)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="center">Recall</TableCell>
          <TableCell align="center">{round(simulation.recall)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="center">F1 Score</TableCell>
          <TableCell align="center">{round(simulation.f1Score)}</TableCell>
        </TableRow> */}
      </TableBody>
    </TableContainer>
  );
}
