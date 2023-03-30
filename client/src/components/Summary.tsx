/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */

import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Launch } from "@mui/icons-material";
import { Experiment, Simulation } from "../games/simulator";
import { formatDateTime, sortExperimentsByF1Score } from "../utils";
import {
  DialogueMessage,
  UseWithDialogue,
  useWithDialogue,
} from "../hooks/use-with-dialogue";
import { TooltipMsg } from "./Dialogue";

function round(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function PreviousExperimentsView(props: {
  classes: Record<string, any>;
  dialogue: UseWithDialogue;
  currentExperiment: Experiment<Simulation>;
  previousExperiments: Experiment<Simulation>[];
  setExperiment: (e: Experiment<Simulation>) => void;
}) {
  const { classes, previousExperiments, setExperiment, currentExperiment } =
    props;
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
            <TableCell align="right">Score</TableCell>
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

function CurrentExperimentView(props: {
  classes: Record<string, any>;
  currentExperiment: Experiment<Simulation>;
  dialogue: UseWithDialogue;
  isGameActivity: boolean;
  runSimulation: (i: number) => void;
  goToNotebook: () => void;
  onSubmit: () => void;
}) {
  const { isGameActivity } = props;
  const classes = props.classes;
  const {
    summary,
    simulations,
    time: dateOfExperiment,
    trainInstances,
    testInstances,
  } = props.currentExperiment;

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
          <TableRow>
            <TableCell align="center">Train Instances</TableCell>
            <TableCell align="center">{trainInstances}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">Test Instances</TableCell>
            <TableCell align="center">{testInstances}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">Accuracy</TableCell>
            <TableCell align="center">
              {round(summary.averageAccuracy)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">Precision</TableCell>
            <TableCell align="center">
              {round(summary.averagePrecision)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">Recall</TableCell>
            <TableCell align="center">{round(summary.averageRecall)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">F1 Score</TableCell>
            <TableCell align="center">
              {round(summary.averageF1Score)}
            </TableCell>
          </TableRow>
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
            <TableCell align="right">Score</TableCell>
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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
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
      </div>
    </div>
  );
}

function Summary(props: {
  experiment: Experiment<Simulation>;
  isGameActivity: boolean;
  previousExperiments: Experiment<Simulation>[];
  runSimulation: (i: number) => void;
  goToNotebook: () => void;
  setExperiment: React.Dispatch<
    React.SetStateAction<Experiment<Simulation> | undefined>
  >;
  onSubmit: () => void;
}): JSX.Element {
  const {
    runSimulation,
    goToNotebook,
    experiment,
    previousExperiments,
    setExperiment,
    onSubmit,
    isGameActivity,
  } = props;
  const { summary } = experiment;
  const [viewPreviousExperiment, setViewPreviousExperiments] = useState(false);
  const classes = useStyles();
  const dialogue = useWithDialogue();

  function _setExperiment(experiment: Experiment<Simulation>) {
    setExperiment(experiment);
    setViewPreviousExperiments(false);
  }

  useEffect(() => {
    const msgs: DialogueMessage[] = [];
    if (summary.averageAccuracy <= 0.6) {
      msgs.push({
        id: "notebook",
        title: "Results Very Bad",
        text: "Something seems wrong, barely better than random. Maybe check the model training.",
        noSave: true,
      });
    } else if (summary.averageAccuracy <= 0.8) {
      msgs.push({
        id: "notebook",
        title: "Results Okay",
        text: "The classifier works! But can we do better?",
        noSave: true,
      });
    } else {
      msgs.push({
        id: "submit",
        title: "Results Very Good",
        text: "That was a good run! Do you want to submit this or tune it more?",
        noSave: true,
      });
    }
    dialogue.addMessages(msgs);
  }, [summary]);

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
            classes,
            previousExperiments,
            dialogue,
            setExperiment: _setExperiment,
            currentExperiment: experiment,
          })
        : CurrentExperimentView({
            classes,
            currentExperiment: experiment,
            dialogue,
            isGameActivity,
            runSimulation,
            goToNotebook,
            onSubmit,
          })}
    </div>
  );
}

const useStyles = makeStyles({
  sticky: {
    position: "sticky",
    background: "white",
    right: 0,
  },
});

export default Summary;
