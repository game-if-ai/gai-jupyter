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
import { TooltipMsg } from "../../../components/Dialogue";
import { formatDateTime } from "../../../utils";
import { useAppSelector } from "../../../store";
import { useWithState } from "../../../store/state/useWithState";
import { NMTCodeInfo } from "../hooks/use-with-nn-code-examine";

interface CurExperimentAvgDisplay {
  metricName: string;
  metricValue: string | number | boolean;
}

export function NMTCurrentExperimentView(props: {
  classes: Record<string, any>;
  onSubmit: () => void;
}) {
  const experiment = useAppSelector((s) => s.state.experiment!);
  const codeInfo = experiment.codeInfo as NMTCodeInfo;
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
        </BottomNavigation>
      </Paper>
    </div>
  );
}
