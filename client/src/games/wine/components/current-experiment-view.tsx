/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  BottomNavigation,
  Button,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import Cmi5 from "@xapi/cmi5";
import { TooltipMsg } from "../../../components/Dialogue";
import { formatDateTime } from "../../../utils";
import { useAppSelector } from "../../../store";
import { useWithState } from "../../../store/state/useWithState";
import { WineCodeInfo } from "../hooks/use-with-wine-code-examine";

interface CurExperimentAvgDisplay {
  metricName: string;
  metricValue: string | number | boolean;
}

export function WineCurrentExperimentView(props: {
  classes: Record<string, any>;
  onSubmit: () => void;
}) {
  const experiment = useAppSelector((s) => s.state.experiment!);
  const codeInfo = experiment.codeInfo as WineCodeInfo;
  const { time: dateOfExperiment } = experiment;
  const { toNotebook } = useWithState();

  function curExperimentAverageDisplays(): CurExperimentAvgDisplay[] {
    return [
      {
        metricName: "Utilizes the tokenizers fit_on_texts function",
        metricValue: codeInfo.callsFitOnTexts,
      },
      {
        metricName: "Utilizes the tokenizers texts_to_sequences function",
        metricValue: codeInfo.callsTextsToSequences,
      },
      {
        metricName: "Properly pads data",
        metricValue:
          codeInfo.callsPadSequences &&
          codeInfo.callsPadSequencesWithPaddingPost &&
          codeInfo.callsPadSequencesTwice &&
          codeInfo.callsPadSequencesTwiceWithPaddingPost,
      },
      {
        metricName: "Reshapes data to proper dimensions",
        metricValue: codeInfo.preprocessedDataCorrectDimensions,
      },
      {
        metricName: "Utilizes Argmax",
        metricValue: codeInfo.callsArgmax,
      },
      {
        metricName: "Output is translated to french words using Neural Network",
        metricValue: codeInfo.outputCorrectlyFormatted,
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
        <Typography variant="h5">Experiment Goals</Typography>
        <TableBody>
          {curExperimentAverageDisplays().map((display) => {
            const metricValue = display.metricValue.toString();
            return (
              <TableRow>
                <TableCell align="center">{display.metricName}</TableCell>
                <TableCell
                  style={{ color: metricValue === "false" ? "red" : "green" }}
                  align="center"
                >
                  {metricValue}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>
      <Typography variant="h5">Summary</Typography>
      <Typography>
        {codeInfo.outputCorrectlyFormatted
          ? "Great job! You were able to preprocess and postprocess that data fed into a neural network."
          : "Oh no, your translated output does not look quite correct. Please review the experiment goals."}
      </Typography>
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation>
          <TooltipMsg elemId="notebook">
            <Button
              data-elemid="notebook"
              variant="contained"
              onClick={toNotebook}
              style={{ margin: 10 }}
            >
              Notebook
            </Button>
          </TooltipMsg>
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
