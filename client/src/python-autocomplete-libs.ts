/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Completion } from "@codemirror/autocomplete";
import { apply } from "./utils";

export const pythonLibs: Completion[] = [
  // SKLEARN
  {
    label: "from sklearn import model_selection, linear_model",
    type: "text",
    apply,
  },
  {
    label: "from sklearn.model_selection import LeaveOneOut",
    type: "text",
    apply,
  },
  {
    label: "from sklearn.preprocessing import LabelEncoder",
    type: "text",
    apply,
  },
  {
    label: "from sklearn.cluster import DBSCAN",
    type: "text",
    apply,
  },
  {
    label: "from sklearn.feature_selection import SelectKBest, chi2",
    type: "text",
    apply,
  },
  // SCIPY
  {
    label: "from scipy.optimize import linear_sum_assignment",
    type: "text",
    apply,
  },
  {
    label: "from scipy import spatial",
    type: "text",
    apply,
  },
  // NUMPY
  {
    label: "import numpy",
    type: "namespace",
    apply,
    detail: "fundamental package for scientific computing",
  },
  {
    label: "arr_numpy = numpy.array([1, 2, 3])",
    type: "text",
    apply,
    detail: "create a numpy array",
  },
  {
    label: "arr_numpy = numpy.array([1, 2], [3, 4])",
    type: "text",
    apply,
    detail: "create a 2D numpy array / matrix",
  },
  {
    label: "arr_numpy = numpy.empty(6)",
    type: "text",
    apply,
    detail: "create a numpy array with 6 random elements",
  },
  {
    label: "arr_numpy = numpy.arange(6)",
    type: "text",
    apply,
    detail: "create a numpy array with values 1-6",
  },
  {
    label: "numpy.sort(arr_numpy)",
    type: "text",
    apply,
    detail: "sort numpy array in ascending order",
  },
  {
    label: "numpy.concatenate((arrA, arrB))",
    type: "text",
    apply,
    detail: "concatenate 2 numpy arrays",
  },
  {
    label: "arr_numpy.ndim",
    type: "text",
    apply,
    detail: "find the number of dimensions of the array",
  },
  {
    label: "arr_numpy.size",
    type: "text",
    apply,
    detail: "find the total number of elements in the array",
  },
  {
    label: "arr_numpy.shape",
    type: "text",
    apply,
    detail: "find the shape of the array",
  },
  {
    label: "arr_numpy.reshape(r, c)",
    type: "text",
    apply,
    detail: "reshape numpy array to have r rows and c columns",
  },
  {
    label: "arr_numpy1 + arr_numpy2",
    type: "text",
    apply,
    detail: "perform operations on two numpy arrays with + - * /",
  },
  {
    label: "arr_numpy * n",
    type: "text",
    apply,
    detail: "multiply numpy array with a scalar, n",
  },
  {
    label: "arr_numpy.flatten()",
    type: "text",
    apply,
    info: "flatten array into a 1D array",
    detail: "find the sum of the elements in an array",
  },
  {
    label: "arr_numpy.sum()",
    type: "text",
    apply,
    info: "for 2D array, use axis=0 for row and axis=1 for column",
    detail: "find the sum of the elements in an array",
  },
  {
    label: "arr_numpy.max()",
    type: "text",
    apply,
    info: "for 2D array, use axis=0 for row and axis=1 for column",
  },
  {
    label: "arr_numpy.min()",
    type: "text",
    apply,
    info: "for 2D array, use axis=0 for row and axis=1 for column",
  },
  {
    label: "numpy.flip(arr_numpy)",
    type: "text",
    apply,
    detail: "reverse a numpy array",
    info: "for 2D array, use axis=0 for row and axis=1 for column",
  },
];
