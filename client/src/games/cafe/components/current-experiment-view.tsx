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
import { CafeExperiment } from "games/cafe/simulator";
import { UseWithDialogue } from "hooks/use-with-dialogue";
import { TooltipMsg } from "../../../components/Dialogue";
import { formatDateTime, round } from "../../../utils";

interface CurExperimentAvgDisplay {
  metricName: string;
  metricValue: string | number;
}

export function CafeCurrentExperimentView(props: {
  classes: Record<string, any>;
  currentExperiment: CafeExperiment;
  dialogue: UseWithDialogue;
  isGameActivity: boolean;
  runSimulation: (i: number) => void;
  goToNotebook: () => void;
  onSubmit: () => void;
}) {
  const { isGameActivity, currentExperiment } = props;
  const classes = props.classes;
  const {
    summary,
    simulations,
    time: dateOfExperiment,
    trainInstances,
    testInstances,
  } = currentExperiment;

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
          {curExperimentAverageDisplays().map((display) => {
            return (
              <TableRow>
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
            {isGameActivity ? (
              <TableCell align="right" className={classes.sticky}>
                View
              </TableCell>
            ) : undefined}
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
              {isGameActivity ? (
                <TableCell align="center" className={classes.sticky}>
                  <IconButton
                    size="small"
                    onClick={() => props.runSimulation(i)}
                  >
                    <Launch />
                  </IconButton>
                </TableCell>
              ) : undefined}
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
          <TooltipMsg elemId="notebook" dialogue={props.dialogue}>
            <Button
              data-elemid="notebook"
              variant="contained"
              onClick={props.goToNotebook}
              style={{ margin: 10 }}
            >
              Notebook
            </Button>
          </TooltipMsg>
          {isGameActivity ? (
            <Button
              variant="contained"
              onClick={() => props.runSimulation(0)}
              style={{ marginTop: 10, marginBottom: 10 }}
            >
              Simulator
            </Button>
          ) : undefined}
          <TooltipMsg elemId="submit" dialogue={props.dialogue}>
            <Button
              data-elemid="submit"
              variant="contained"
              style={{ margin: 10 }}
              onClick={props.onSubmit}
            >
              Submit
            </Button>
          </TooltipMsg>
        </BottomNavigation>
      </Paper>
    </div>
  );
}
