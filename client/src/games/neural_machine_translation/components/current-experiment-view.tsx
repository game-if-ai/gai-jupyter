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
import { UseWithDialogue } from "../../../hooks/use-with-dialogue";
import { TooltipMsg } from "../../../components/Dialogue";
import { formatDateTime } from "../../../utils";
import { NMTExperiment } from "../simulator";

interface CurExperimentAvgDisplay {
  metricName: string;
  metricValue: string | number | boolean;
}

export function NMTCurrentExperimentView(props: {
  classes: Record<string, any>;
  currentExperiment: NMTExperiment;
  dialogue: UseWithDialogue;
  runSimulation: (i: number) => void;
  goToNotebook: () => void;
  onSubmit: () => void;
}) {
  const { currentExperiment } = props;
  const { time: dateOfExperiment } = currentExperiment;

  function curExperimentAverageDisplays(): CurExperimentAvgDisplay[] {
    return [
      {
        metricName: "Utilizes the tokenizers fit_on_texts function",
        metricValue: currentExperiment.codeInfo.callsFitOnTexts,
      },
      {
        metricName: "Utilizes the tokenizers texts_to_sequences function",
        metricValue: currentExperiment.codeInfo.callsTextsToSequences,
      },
      {
        metricName: "Properly pads data",
        metricValue:
          currentExperiment.codeInfo.callsPadSequences &&
          currentExperiment.codeInfo.callsPadSequencesWithPaddingPost &&
          currentExperiment.codeInfo.callsPadSequencesTwice &&
          currentExperiment.codeInfo.callsPadSequencesTwiceWithPaddingPost,
      },
      {
        metricName: "Reshapes data to proper dimensions",
        metricValue:
          currentExperiment.codeInfo.callsReshape &&
          currentExperiment.codeInfo.callsReshapeOnXAndY,
      },
      {
        metricName: "Utilizes Argmax",
        metricValue: currentExperiment.codeInfo.callsArgmax,
      },
      {
        metricName: "Output is translated to french words using Neural Network",
        metricValue: currentExperiment.codeInfo.outputCorrectlyFormatted,
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
        {currentExperiment.codeInfo.outputCorrectlyFormatted
          ? "Great job! You were able to preprocess and postprocess that data fed into a neural network."
          : "Oh no, your translated output does not look quite correct. Please review the experiment goals."}
      </Typography>
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
