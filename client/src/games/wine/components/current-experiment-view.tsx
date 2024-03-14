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
  TableHead,
} from "@mui/material";
import Cmi5 from "@xapi/cmi5";
import { TooltipMsg } from "../../../components/Dialogue";
import { formatDateTime } from "../../../utils";
import { useAppSelector } from "../../../store";
import { useWithState } from "../../../store/state/useWithState";
import { WineSimulationsSummary } from "../simulator";

export function WineCurrentExperimentView(props: {
  classes: Record<string, any>;
  onSubmit: () => void;
}) {
  const experiment = useAppSelector((s) => s.state.experiment!);
  const { clusters } = experiment.summary as WineSimulationsSummary;
  const { time: dateOfExperiment } = experiment;
  const { toNotebook } = useWithState();

  return (
    <div
      data-cy="current-experiment-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "90vh",
        justifyContent: "center",
      }}
    >
      <Typography variant="h3">Experiment</Typography>
      <Typography>
        Date of experiment: {formatDateTime(dateOfExperiment)}
      </Typography>
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
        data-cy="data-table-container"
      >
        <TableHead data-cy="data-table-head">
          <TableRow>
            <TableCell align="center">Cluster Size</TableCell>
            <TableCell align="center">Quality</TableCell>
          </TableRow>
        </TableHead>
        <TableBody data-cy="data-table-body">
          {clusters.map((s, i) => (
            <TableRow
              key={i}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              data-cy={`data-table-row-${i}`}
            >
              <TableCell align="center" component="th" scope="row">
                {s.numMembers}
              </TableCell>
              <TableCell align="center">{s.quality}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>

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
