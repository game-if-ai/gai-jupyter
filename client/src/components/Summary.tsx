/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState } from "react";
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
import { Experiment, Simulation } from "../games/simulator";
import { formatDateTime } from "../utils";

function PreviousExperimentsView(props: {
  previousExperiments: Experiment<Simulation>[];
  setExperiment: (e: Experiment<Simulation>) => void;
}) {
  const { previousExperiments, setExperiment } = props;
  console.log(previousExperiments);
  return (
    <div>
      <Typography variant="h3">Previous Experiments</Typography>
      <TableContainer
        component={Paper}
        style={{
          width: "fit-content",
          outline: "black solid 1px",
          marginLeft: "auto",
          marginRight: "auto",
          margin: 20,
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="right">Date/Time</TableCell>
            <TableCell align="right">Train Instances</TableCell>
            <TableCell align="right">Test Instances</TableCell>
            <TableCell align="right">Score</TableCell>
            <TableCell align="right">Accuracy</TableCell>
            <TableCell align="right">Precision</TableCell>
            <TableCell align="right">Recall</TableCell>
            <TableCell align="right">F1 Score</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {previousExperiments.map((previousExperiment) => {
            const { summary, time: dateOfExperiment } = previousExperiment;
            return (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="center">
                  {formatDateTime(dateOfExperiment)}
                </TableCell>
                <TableCell align="center">
                  {previousExperiment.trainInstances}
                </TableCell>
                <TableCell align="center">
                  {previousExperiment.testInstances}
                </TableCell>
                <TableCell align="center">{summary.averageScore}</TableCell>
                <TableCell align="center">{`${
                  Math.round(summary.averageAccuracy * 100 * 100) / 100
                }%`}</TableCell>
                <TableCell align="center">{`${
                  Math.round(summary.averagePrecision * 100 * 100) / 100
                }%`}</TableCell>
                <TableCell align="center">{`${
                  Math.round(summary.averageRecall * 100 * 100) / 100
                }%`}</TableCell>
                <TableCell align="center">{`${
                  Math.round(summary.averageF1Score * 100 * 100) / 100
                }%`}</TableCell>
                <TableCell align="center">
                  <Button
                    onClick={() => {
                      setExperiment(previousExperiment);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>
    </div>
  );
}

function CurrentExperimentView(props: {
  currentExperiment: Experiment<Simulation>;
  runSimulation: (i: number) => void;
  goToNotebook: () => void;
}) {
  const {
    summary,
    simulations,
    time: dateOfExperiment,
  } = props.currentExperiment;
  return (
    <div>
      <Typography variant="h3">Current Experiment</Typography>
      <Typography>
        Date of experiment: {formatDateTime(dateOfExperiment)}
      </Typography>
      <TableContainer
        component={Paper}
        style={{
          width: "fit-content",
          outline: "black solid 1px",
          marginLeft: "auto",
          marginRight: "auto",
          margin: 20,
        }}
      >
        <Typography variant="h5">Experiment Averages</Typography>
        <Typography>({simulations.length} Runs)</Typography>
        <TableHead>
          <TableRow>
            <TableCell align="right">Train Instances</TableCell>
            <TableCell align="right">Test Instances</TableCell>
            <TableCell align="right">Score</TableCell>
            <TableCell align="right">Accuracy</TableCell>
            <TableCell align="right">Precision</TableCell>
            <TableCell align="right">Recall</TableCell>
            <TableCell align="right">F1 Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="center">80</TableCell>
            <TableCell align="center">20</TableCell>
            <TableCell align="center">{summary.averageScore}</TableCell>
            <TableCell align="center">{`${
              Math.round(summary.averageAccuracy * 100 * 100) / 100
            }%`}</TableCell>
            <TableCell align="center">{`${
              Math.round(summary.averagePrecision * 100 * 100) / 100
            }%`}</TableCell>
            <TableCell align="center">{`${
              Math.round(summary.averageRecall * 100 * 100) / 100
            }%`}</TableCell>
            <TableCell align="center">{`${
              Math.round(summary.averageF1Score * 100 * 100) / 100
            }%`}</TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
      <Typography variant="h5" style={{ margin: 20 }}>
        Individual Runs
      </Typography>
      <TableContainer
        component={Paper}
        style={{
          width: "fit-content",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Run #</TableCell>
            <TableCell align="right">Score</TableCell>
            <TableCell align="right">Accuracy</TableCell>
            <TableCell align="right">Precision</TableCell>
            <TableCell align="right">Recall</TableCell>
            <TableCell align="right">F1 Score</TableCell>
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
              <TableCell align="center">{`${
                Math.round(s.accuracy * 100 * 100) / 100
              }%`}</TableCell>
              <TableCell align="center">{`${
                Math.round(s.precision * 100 * 100) / 100
              }%`}</TableCell>
              <TableCell align="center">{`${
                Math.round(s.recall * 100 * 100) / 100
              }%`}</TableCell>
              <TableCell align="center">{`${
                Math.round(s.f1Score * 100 * 100) / 100
              }%`}</TableCell>
              <TableCell align="center">
                <Button onClick={() => props.runSimulation(i)}>Run</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="contained"
          onClick={props.goToNotebook}
          style={{ margin: 10 }}
        >
          Notebook
        </Button>
        <Button
          variant="contained"
          onClick={() => props.runSimulation(0)}
          style={{ marginTop: 10, marginBottom: 10 }}
        >
          Simulator
        </Button>
        <Button variant="contained" style={{ margin: 10 }}>
          Submit
        </Button>
      </div>
    </div>
  );
}

function Summary(props: {
  experiment: Experiment<Simulation>;
  previousExperiments: Experiment<Simulation>[];
  runSimulation: (i: number) => void;
  goToNotebook: () => void;
  setExperiment: React.Dispatch<
    React.SetStateAction<Experiment<Simulation> | undefined>
  >;
}): JSX.Element {
  const {
    runSimulation,
    goToNotebook,
    experiment,
    previousExperiments,
    setExperiment,
  } = props;
  const [viewPreviousExperiment, setViewPreviousExperiments] = useState(false);

  function _setExperiment(experiment: Experiment<Simulation>) {
    setExperiment(experiment);
    setViewPreviousExperiments(false);
  }

  return (
    <div>
      {previousExperiments.length > 0 ? (
        <Button
          onClick={() => setViewPreviousExperiments((prevValue) => !prevValue)}
        >
          {viewPreviousExperiment
            ? "view current experiment"
            : "view Previous Experiments"}
        </Button>
      ) : undefined}
      {viewPreviousExperiment
        ? PreviousExperimentsView({
            previousExperiments,
            setExperiment: _setExperiment,
          })
        : CurrentExperimentView({
            currentExperiment: experiment,
            runSimulation,
            goToNotebook,
          })}
    </div>
  );
}

export default Summary;
