import React from "react";
import {
  IconButton,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Launch } from "@mui/icons-material";

import {
  formatDateTime,
  round,
  sortExperimentsByF1Score,
} from "../../../utils";
import { CafeExperiment } from "../simulator";
import { AllExperimentTypes } from "../../activity-types";
import { useAppSelector } from "../../../store";

export function CafePreviousExperimentsView(props: {
  classes: Record<string, any>;
  setExperiment: (e: AllExperimentTypes) => void;
}) {
  const activity = useAppSelector((s) => s.state.activity!);
  const currentExperiment = useAppSelector(
    (s) => s.state.experiment! as CafeExperiment
  );
  const previousExperiments = activity.simulator
    .experiments as CafeExperiment[];

  const { classes, setExperiment } = props;
  const experimentsSortedByF1score =
    sortExperimentsByF1Score(previousExperiments);
  const moreThanOnePreviousExperiment = experimentsSortedByF1score.length > 1;
  const bestRunId = moreThanOnePreviousExperiment
    ? experimentsSortedByF1score[experimentsSortedByF1score.length - 1].id
    : "";
  const worstRunId = moreThanOnePreviousExperiment
    ? experimentsSortedByF1score[0].id
    : "";
  return (
    <div>
      <Typography variant="h3">Previous Experiments</Typography>
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
            <TableCell align="right">Date/Time</TableCell>
            <TableCell align="right">Train</TableCell>
            <TableCell align="right">Test</TableCell>
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
          {previousExperiments
            .slice()
            .reverse()
            .map((previousExperiment, i) => {
              const experimentSelected =
                previousExperiment.id === currentExperiment.id;
              const isBestExperiment = bestRunId === previousExperiment.id;
              const isWorstExperiment = worstRunId === previousExperiment.id;
              const { summary, time: dateOfExperiment } = previousExperiment;
              return (
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  style={{
                    backgroundColor: experimentSelected ? "#D3D3D3" : "white",
                  }}
                >
                  <TableCell align="center">
                    {isBestExperiment || isWorstExperiment ? (
                      <span
                        style={{
                          color: isBestExperiment ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {isBestExperiment
                          ? "Best Experiment"
                          : "Worst Experiment"}
                      </span>
                    ) : (
                      ""
                    )}
                    <br />
                    {formatDateTime(dateOfExperiment)}
                  </TableCell>
                  <TableCell align="center">
                    {previousExperiment.trainInstances}
                  </TableCell>
                  <TableCell align="center">
                    {previousExperiment.testInstances}
                  </TableCell>
                  <TableCell align="center">
                    {round(summary.averageAccuracy)}
                  </TableCell>
                  <TableCell align="center">
                    {round(summary.averagePrecision)}
                  </TableCell>
                  <TableCell align="center">
                    {round(summary.averageRecall)}
                  </TableCell>
                  <TableCell align="center">
                    {round(summary.averageF1Score)}
                  </TableCell>
                  {}
                  <TableCell align="center" className={classes.sticky}>
                    {!experimentSelected ? (
                      <IconButton
                        size="small"
                        onClick={() => setExperiment(previousExperiment)}
                      >
                        <Launch />
                      </IconButton>
                    ) : undefined}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </TableContainer>
    </div>
  );
}
