/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  IOutput,
  isError,
  isStream,
  IError,
  isDisplayData,
} from "@jupyterlab/nbformat";
import { JsonView, defaultStyles } from "react-json-view-lite";
import { isValidJSON, splitListOfStringsBy } from "../utils";
import "react-json-view-lite/dist/index.css";

export function Output(props: {
  outputs: IOutput[];
  errorOutput?: IError;
}): JSX.Element {
  const { outputs, errorOutput } = props;

  if (errorOutput) {
    return (
      <div style={{ backgroundColor: "#FFCCCB", height: "fit-content" }}>
        {`${errorOutput.ename}`}
        <br />
        {`${errorOutput.evalue}`}
      </div>
    );
  }

  return (
    <div>
      {outputs.map((output, i) => {
        if (!output && !errorOutput) {
          return <div key={i}></div>;
        }
        if (
          isStream(output) &&
          output.text.includes("you can ignore this message")
        ) {
          // TODO: This is a hack to ignore messages from tensorflow that we don't need to see, need to turn off messages some other way
          return <div key={i}></div>;
        }
        if (isStream(output)) {
          const data = Array.isArray(output.text) ? output.text : [output.text];
          const effectiveData = splitListOfStringsBy(data, "\n");
          return (
            <div
              key={i}
              style={{ height: "fit-content", backgroundColor: "lightyellow" }}
            >
              {effectiveData.map((line) => {
                return <div>{line}</div>;
              })}
            </div>
          );
        } else if (isError(output)) {
          return (
            <div
              key={i}
              style={{ backgroundColor: "#FFCCCB", height: "fit-content" }}
            >
              {`${output.ename}`}
              <br />
              {`${output.evalue}`}
            </div>
          );
        } else if (isDisplayData(output)) {
          try {
            const data =
              typeof output.text === "string" && isValidJSON(output.text)
                ? JSON.parse(output.text)
                : output.data;
            return (
              <div
                key={i}
                style={{
                  height: "fit-content",
                  backgroundColor: "lightyellow",
                }}
              >
                <JsonView
                  data={data}
                  shouldExpandNode={() => true}
                  style={defaultStyles}
                />
              </div>
            );
          } catch (err) {
            console.log(err);
            return (
              <div
                key={i}
                style={{
                  height: "fit-content",
                  backgroundColor: "lightyellow",
                }}
              ></div>
            );
          }
        } else {
          try {
            const data = JSON.parse(
              JSON.stringify((output.data as any)["application/json"])
            );
            return <div key={i}>{data}</div>;
          } catch (err) {
            return <div key={i}></div>;
          }
        }
      })}
    </div>
  );
}
