/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useMemo } from "react";
import { IOutput } from "@jupyterlab/nbformat";
import { useJupyter, Kernel, Output } from "@datalayer/jupyter-react";

import "./../index.css";

const SOURCE_IPYWIDGET = `import ipywidgets as widgets
widgets.IntSlider(
    value=7,
    min=0,
    max=10,
    step=1
)`;
const OUTPUT_2: IOutput[] = [
  {
    data: {
      "application/json": {
        array: [1, 2, 3],
        bool: true,
        object: {
          foo: "bar",
        },
        string: "string",
      },
      "text/plain": ["<IPython.core.display.JSON object>"],
    },
    execution_count: 8,
    metadata: {
      "application/json": {
        expanded: false,
        root: "root",
      },
    },
    output_type: "execute_result",
  },
];

/**
 * A simple example for the React Editor.
 */
export const OutputsComponents = () => {
  const { kernelManager } = useJupyter();
  const kernel = useMemo(() => {
    if (kernelManager)
      return new Kernel({ kernelManager, kernelName: "python3" });
  }, [kernelManager]);
  return (
    <>
      <h3>Simple Output</h3>
      <Output
        autoRun={true}
        kernel={kernel}
        code={"print('Hello Datalayer 👍')"}
      />
      <h3>IPyWidget Output</h3>
      <Output autoRun={true} kernel={kernel} code={SOURCE_IPYWIDGET} />
      <h3>JSON Output</h3>
      <Output outputs={OUTPUT_2} autoRun={false} kernel={kernel} />
    </>
  );
};

export default OutputsComponents;
