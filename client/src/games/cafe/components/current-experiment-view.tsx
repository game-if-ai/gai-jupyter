/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  BottomNavigation,
  Button,
  IconButton,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import { Launch } from "@mui/icons-material";
import Cmi5 from "@xapi/cmi5";

import { TooltipMsg } from "../../../components/Dialogue";
import { useAppSelector } from "../../../store";
import { useWithState } from "../../../store/state/useWithState";
import { formatDateTime, round } from "../../../utils";
import { CafeSimulationOutput, CafeSimulationsSummary } from "../simulator";

interface CurExperimentAvgDisplay {
  metricName: string;
  metricValue: string | number;
}

export function CafeCurrentExperimentView(props: {
  classes: Record<string, any>;
  onSubmit: () => void;
}) {
  const classes = props.classes;
  const { loadSimulation, toNotebook } = useWithState();
  const experiment = useAppSelector((s) => s.state.experiment!);
  const summary = experiment.summary as CafeSimulationsSummary;
  const simulations = experiment.simulations as CafeSimulationOutput[];
  const { time: dateOfExperiment, trainInstances, testInstances } = experiment;

  function curExperimentAverageDisplays(): CurExperimentAvgDisplay[] {
    return [
      {
        metricName: "Train Instances",
        metricValue: trainInstances,
      },
      {
        metricName: "Test Instances",
        metricValue: testInstances,
      },
      {
        metricName: "Accuracy",
        metricValue: round(summary.averageAccuracy),
      },
      {
        metricName: "Precision",
        metricValue: round(summary.averagePrecision),
      },
      {
        metricName: "Recall",
        metricValue: round(summary.averageRecall),
      },
      {
        metricName: "F1 Score",
        metricValue: round(summary.averageF1Score),
      },
    ];
  }

  return (
    <div
      data-cy="current-experiment-container"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography variant="h3">Experiment</Typography>
      <Typography>
        Date of experiment: {formatDateTime(dateOfExperiment)}
      </Typography>
      <TableContainer
        component={Paper}
        style={{
          width: "fit-content",
          outline: "black solid 1px",
          padding: 20,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <Typography variant="h5">Experiment Averages</Typography>
        <TableBody>
          {curExperimentAverageDisplays().map((display, i) => {
            return (
              <TableRow
              data-cy={`data-table-row-${i}`}
              >
                <TableCell align="center">{display.metricName}</TableCell>
                <TableCell align="center">{display.metricValue}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>
      <Typography variant="h5">Individual Runs</Typography>
      <TableContainer
        component={Paper}
        style={{
          width: "fit-content",
          maxWidth: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          outline: "black solid 1px",
          marginTop: 20,
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Run #</TableCell>
            <TableCell align="right">Accuracy</TableCell>
            <TableCell align="right">Precision</TableCell>
            <TableCell align="right">Recall</TableCell>
            <TableCell align="right">F1 Score</TableCell>
            <TableCell align="right" className={classes.sticky}>
              View
            </TableCell>
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
              <TableCell align="center">{round(s.accuracy)}</TableCell>
              <TableCell align="center">{round(s.precision)}</TableCell>
              <TableCell align="center">{round(s.recall)}</TableCell>
              <TableCell align="center">{round(s.f1Score)}</TableCell>
              <TableCell align="center" className={classes.sticky}>
                <IconButton size="small" onClick={() => loadSimulation(i)}>
                  <Launch />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
      <Toolbar />
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation>
          <TooltipMsg elemId="notebook">
            <Button
              data-elemid="notebook"
              data-cy="notebook-btn"
              variant="contained"
              onClick={toNotebook}
              style={{ margin: 10 }}
            >
              Notebook
            </Button>
          </TooltipMsg>
          <Button
            variant="contained"
            data-cy="simulator-btn"
            onClick={() => loadSimulation(0)}
            style={{ marginTop: 10, marginBottom: 10 }}
          >
            Simulator
          </Button>
          {Cmi5.isCmiAvailable ? (
            <TooltipMsg elemId="submit">
              <Button
                data-elemid="submit"
                variant="contained"
                style={{ margin: 10 }}
                onClick={props.onSubmit}
              >
                Submit
              </Button>
            </TooltipMsg>
          ) : undefined}
        </BottomNavigation>
      </Paper>
    </div>
  );
}
