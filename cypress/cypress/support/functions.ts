/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CodeExecutorResponseData } from "./types";

interface StaticResponse {
  /**
   * Serve a fixture as the response body.
   */
  fixture?: string;
  /**
   * Serve a static string/JSON object as the response body.
   */
  body?: string | object | object[];
  /**
   * HTTP headers to accompany the response.
   * @default {}
   */
  headers?: { [key: string]: string };
  /**
   * The HTTP status code to send.
   * @default 200
   */
  statusCode?: number;
  /**
   * If 'forceNetworkError' is truthy, Cypress will destroy the browser connection
   * and send no response. Useful for simulating a server that is not reachable.
   * Must not be set in combination with other options.
   */
  forceNetworkError?: boolean;
  /**
   * Milliseconds to delay before the response is sent.
   */
  delayMs?: number;
  /**
   * Kilobits per second to send 'body'.
   */
  throttleKbps?: number;
}

interface MockGraphQLQuery {
  query: string;
  data: any | any[];
  params?: { statusCode: number };
}

function staticResponse(s: StaticResponse): StaticResponse {
  return {
    ...{
      headers: {
        "access-control-allow-origin": window.location.origin,
        "Access-Control-Allow-Credentials": "true",
      },
      ...s,
    },
  };
}

export function cySetup(cy) {
  cy.viewport(1280, 720);
  cy.clearLocalStorage();
}

export function mockGQL(
  query: string,
  data: any | any[],
  params?: { statusCode: number }
): MockGraphQLQuery {
  return {
    query,
    data,
    params,
  };
}

export function cyInterceptGraphQL(cy, mocks: MockGraphQLQuery[]): void {
  const queryCalls: any = {};
  for (const mock of mocks) {
    queryCalls[mock.query] = 0;
  }
  cy.intercept("/graphql/graphql", (req) => {
    const { body } = req;
    const queryBody = body.query.replace(/\s+/g, " ").replace("\n", "").trim();
    let handled = false;
    for (const mock of mocks) {
      if (
        queryBody.match(new RegExp(`^(mutation|query) ${mock.query}[{(\\s]`))
      ) {
        const data = Array.isArray(mock.data) ? mock.data : [mock.data];
        const val = data[Math.min(queryCalls[mock.query], data.length - 1)];
        let body = val;
        req.alias = mock.query;
        req.reply(
          staticResponse({
            statusCode: mock.params?.statusCode || 200,
            body: {
              data: body,
              errors: null,
            },
          })
        );
        queryCalls[mock.query] += 1;
        handled = true;
        break;
      }
    }
    if (!handled) {
      console.error(`failed to handle query for...`);
      console.error(req);
    }
  });
}

export function cyMockDefault(
  cy,
  args: {
    gqlQueries?: MockGraphQLQuery[];
  } = {}
) {
  const gqlQueries = args?.gqlQueries || [];
  cySetup(cy);
  cyInterceptGraphQL(cy, [
    ...gqlQueries,
    //Defaults
    //   mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
  ]);
}

interface MockedResData<T> {
  resData: T;
  statusCode: number;
  contentType?: string;
}

export function cyMockMultipleResponses<T>(
  cy,
  urlRegex: string,
  alias: string,
  res: MockedResData<T>[]
) {
  let numCalls = 0;
  cy.intercept(urlRegex, (req) => {
    const {
      statusCode: _statusCode,
      contentType,
      resData,
    } = res[numCalls % res.length];
    req.alias = alias;
    const statusCode = _statusCode
      ? Array.isArray(_statusCode)
        ? _statusCode[numCalls]
        : _statusCode
      : 200;
    req.reply(
      staticResponse({
        statusCode: statusCode,
        body: {
          data: resData,
        },
        headers: {
          "Content-Type": contentType || "application/json",
        },
      })
    );
    numCalls++;
  });
}

export function cyMockExecuteResponse<T>(
  cy,
  params: {
    responses?: MockedResData<T>[];
  } = {}
) {
  const { responses } = params;
  cyMockMultipleResponses(cy, "**/executor/execute", "Execute", [
    {
      resData: {
        id: "123",
        status: "QUEUED",
        statusUrl: `/execute/status/123`,
      },
      statusCode: 200,
    },
  ]);

  cyMockMultipleResponses<T>(cy, "**/execute/status/**", "Status", responses);
}

export function replaceModelCellWithCode(
  cy,
  code: string,
  cellNumber?: number
) {
  const cell = cellNumber !== undefined ? cellNumber : 1;
  cy.get("[data-cy=cell]")
    .eq(cell)
    .within(($em) => {
      cy.get(".cm-line").eq(0).type("{ctrl}a{del}");
      cy.get(".cm-line")
        .eq(0)
        .type(code, { delay: 0, parseSpecialCharSequences: false });
    });
}
