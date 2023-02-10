/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { selectCell, cellActions } from "@datalayer/jupyter-react";

const CellToolbar: React.FC = () => {
  const cell = selectCell();
  const dispatch = useDispatch();
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Cell Example
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => dispatch(cellActions.execute())}
      >
        Run
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => dispatch(cellActions.outputsCount(0))}
      >
        Reset outputs count
      </Button>
      <Typography variant="subtitle1" gutterBottom>
        Outputs count: {cell.outputsCount}
      </Typography>
    </>
  );
};

export default CellToolbar;
