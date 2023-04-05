/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { INotebookState, Kernel, useJupyter } from "@datalayer/jupyter-react";
import { useEffect, useState } from "react";
import { KernelManager } from "@jupyterlab/services";
import useInterval from "./use-interval";

export function useWithActiveKernel() {
  const [kernel, setKernel] = useState<Kernel>();
  const [lastActivity, setLastActivity] = useState(Date.now());

  const kernelManager: KernelManager = useJupyter()
    .kernelManager as KernelManager;

  // useEffect(() => {
  //   setKernel(getActiveKernel());
  // }, [getActiveKernel]);

  useInterval(
    (isCancelled) => {
      if (isCancelled() || !kernel) {
        return;
      }
      if (Date.now() - lastActivity > 5000) {
        console.log("shutting down kernel");
        kernel.shutdown();
        setKernel(undefined);
      }
    },
    kernel ? 1000 : null
  );

  useEffect(() => {
    if (kernel) {
      const handleActivity = () => {
        setLastActivity(Date.now());
      };

      kernel.getJupyterKernel().then((connectedKernel) => {
        connectedKernel.statusChanged.connect(handleActivity);
      });
    }
  }, [kernel]);

  function getActiveKernel() {
    if (kernel) {
      return kernel;
    }
    const newKernel = new Kernel({ kernelManager, kernelName: "python" });
    setKernel(newKernel);
    return newKernel;
  }

  function executeNotebook(notebook: INotebookState) {
    if (!notebook.adapter) {
      return;
    }
    getActiveKernel();
    notebook.adapter.commands.execute("notebook:run-all");
  }

  return {
    getActiveKernel,
    kernel,
    executeNotebook,
  };
}
