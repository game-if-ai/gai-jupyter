/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import {
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Simulation } from "../../simulator";
import { FruitSimulation } from "./simulator";

export function Summary(props: { simulation: Simulation }): JSX.Element {
  const simulation = props.simulation as FruitSimulation;
  return (
    <TableContainer component={Paper}>
      <TableHead>
        <TableRow>
          <TableCell align="right">Label</TableCell>
          <TableCell align="right">Match Label</TableCell>
          <TableCell align="right">Score</TableCell>
          <TableCell align="right">Accuracy</TableCell>
          <TableCell align="right">Precision</TableCell>
          <TableCell align="right">Recall</TableCell>
          <TableCell align="right">F1 Score</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
          <TableCell align="center">{simulation.label}</TableCell>
          <TableCell align="center">{simulation.matchLabel}</TableCell>
          <TableCell align="center">{simulation.score}</TableCell>
          <TableCell align="center">{`${
            Math.round(simulation.accuracy * 100 * 100) / 100
          }%`}</TableCell>
          <TableCell align="center">{`${
            Math.round(simulation.precision * 100 * 100) / 100
          }%`}</TableCell>
          <TableCell align="center">{`${
            Math.round(simulation.recall * 100 * 100) / 100
          }%`}</TableCell>
          <TableCell align="center">{`${
            Math.round(simulation.f1Score * 100 * 100) / 100
          }%`}</TableCell>
        </TableRow>
      </TableBody>
    </TableContainer>
  );
}
