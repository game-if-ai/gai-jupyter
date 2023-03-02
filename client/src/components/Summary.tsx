/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from "react";
import {
  Button,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Simulation, SimulationSummary } from "../games/simulator";

function Summary(props: {
  summary: SimulationSummary;
  simulations: Simulation[];
  runSimulation: (i: number) => void;
  goToNotebook: () => void;
}): JSX.Element {
  const { summary, simulations, runSimulation, goToNotebook } = props;

  return (
    <div>
      <Typography>
        Scores: high={summary.highScore} low={summary.lowScore} average=
        {summary.averageScore}
      </Typography>
      <Typography>
        Accuracy: high={Math.round(summary.highAccuracy * 100)}% low=
        {Math.round(summary.lowAccuracy * 100)}% average=
        {Math.round(summary.averageAccuracy * 100)}%
      </Typography>
      <Button variant="contained" onClick={goToNotebook} style={{ margin: 10 }}>
        Notebook
      </Button>
      <Button
        variant="contained"
        onClick={() => runSimulation(0)}
        style={{ marginTop: 10, marginBottom: 10 }}
      >
        Watch Simulations
      </Button>
      <TableContainer component={Paper} style={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell>Run #</TableCell>
            <TableCell align="right">Score</TableCell>
            <TableCell align="right">Accuracy</TableCell>
            <TableCell align="right">View Simulation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {simulations.map((s, i) => (
            <TableRow
              key={i}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="center" component="th" scope="row">
                {i + 1}
              </TableCell>
              <TableCell align="center">{s.score}</TableCell>
              <TableCell align="center">{`${s.accuracy * 100}%`}</TableCell>
              <TableCell align="center">
                <Button onClick={() => runSimulation(i)}>Run</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
}

export default Summary;
