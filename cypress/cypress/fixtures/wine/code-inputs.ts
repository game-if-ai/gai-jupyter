/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export const dropWine = `
# MODEL
def preprocess(wineDataFrame):
    # 1. drop "Wine" column which just assigns a number (1, 2, ...) to each wine
    # It is okay to modify wineDataFrame
    wineDataFrame.drop("Wine")

    # 2. split into data and labels. It is okay to modify wineDataFrame.

    # 3. scale data but don't overwrite raw data
    # 4. return scaled data and labels.
    raise Exception("preprocess not complete")

wineData_scaled, quality = preprocess(wineData_raw)

raise Exception("Need to define k, number of clusters")

model = cluster(wineData_scaled, k)
`;

export const dropWineWithAxis = `
# MODEL
def preprocess(wineDataFrame):
    # 1. drop "Wine" column which just assigns a number (1, 2, ...) to each wine
    # It is okay to modify wineDataFrame
    wineDataFrame.drop("Wine", axis=1, inplace=True)

    # 2. split into data and labels. It is okay to modify wineDataFrame.

    # 3. scale data but don't overwrite raw data
    # 4. return scaled data and labels.
    raise Exception("preprocess not complete")

wineData_scaled, quality = preprocess(wineData_raw)

raise Exception("Need to define k, number of clusters")

model = cluster(wineData_scaled, k)
`;

export const dropQuality = `
# MODEL
def preprocess(wineDataFrame):
    # 1. drop "Wine" column which just assigns a number (1, 2, ...) to each wine
    # It is okay to modify wineDataFrame
    wineDataFrame.drop("Wine", axis=1, inplace=True)

    # 2. split into data and labels. It is okay to modify wineDataFrame.
    wineDataFrame.drop("quality", axis=1, inplace=True)

    # 3. scale data but don't overwrite raw data
    # 4. return scaled data and labels.
    raise Exception("preprocess not complete")

wineData_scaled, quality = preprocess(wineData_raw)

raise Exception("Need to define k, number of clusters")

model = cluster(wineData_scaled, k)
`;

export const saveQuality = `
# MODEL
def preprocess(wineDataFrame):
    # 1. drop "Wine" column which just assigns a number (1, 2, ...) to each wine
    # It is okay to modify wineDataFrame
    wineDataFrame.drop("Wine", axis=1, inplace=True)

    # 2. split into data and labels. It is okay to modify wineDataFrame.
    quality = wineDataFrame["quality"]
    wineDataFrame.drop("quality", axis=1, inplace=True)
    
    # 3. scale data but don't overwrite raw data
    # 4. return scaled data and labels.
    raise Exception("preprocess not complete")

wineData_scaled, quality = preprocess(wineData_raw)

raise Exception("Need to define k, number of clusters")

model = cluster(wineData_scaled, k)
`;

export const useStandardScaler = `
# MODEL
def preprocess(wineDataFrame):
    # 1. drop "Wine" column which just assigns a number (1, 2, ...) to each wine
    # It is okay to modify wineDataFrame
    wineDataFrame.drop("Wine", axis=1, inplace=True)

    # 2. split into data and labels. It is okay to modify wineDataFrame.
    quality = wineDataFrame["quality"]
    wineDataFrame.drop("quality", axis=1, inplace=True)
    
    # 3. scale data but don't overwrite raw data
    # 4. return scaled data and labels.
    scaler = StandardScaler()
    raise Exception("preprocess not complete")

wineData_scaled, quality = preprocess(wineData_raw)

raise Exception("Need to define k, number of clusters")

model = cluster(wineData_scaled, k)
`;

export const fitsWithStandardScaler = `
# MODEL
def preprocess(wineDataFrame):
    # 1. drop "Wine" column which just assigns a number (1, 2, ...) to each wine
    # It is okay to modify wineDataFrame
    wineDataFrame.drop("Wine", axis=1, inplace=True)

    # 2. split into data and labels. It is okay to modify wineDataFrame.
    quality = wineDataFrame["quality"]
    wineDataFrame.drop("quality", axis=1, inplace=True)
    
    # 3. scale data but don't overwrite raw data
    # 4. return scaled data and labels.
    scaler = StandardScaler()
    scaler.fit(wineDataFrame)
    raise Exception("preprocess not complete")

wineData_scaled, quality = preprocess(wineData_raw)

raise Exception("Need to define k, number of clusters")

model = cluster(wineData_scaled, k)
`;

export const transformsWithStandardScaler = `
# MODEL
def preprocess(wineDataFrame):
    # 1. drop "Wine" column which just assigns a number (1, 2, ...) to each wine
    # It is okay to modify wineDataFrame
    wineDataFrame.drop("Wine", axis=1, inplace=True)

    # 2. split into data and labels. It is okay to modify wineDataFrame.
    quality = wineDataFrame["quality"]
    wineDataFrame.drop("quality", axis=1, inplace=True)
    
    # 3. scale data but don't overwrite raw data
    # 4. return scaled data and labels.
    scaler = StandardScaler()
    scaler.fit(wineDataFrame)
    scaler.transform(wineDataFrame)
    raise Exception("preprocess not complete")

wineData_scaled, quality = preprocess(wineData_raw)

raise Exception("Need to define k, number of clusters")

model = cluster(wineData_scaled, k)
`;

export const complete = `
def preprocess(wineDataFrame):
    # 1. drop "Wine" column which just assigns a number (1, 2, ...) to each wine
    # It is okay to modify wineDataFrame
    wineDataFrame.drop("Wine", axis=1, inplace=True)

    # 2. split into data and labels. It is okay to modify wineDataFrame.
    quality = wineDataFrame["quality"]
    wineDataFrame.drop("quality", axis=1, inplace=True)

    # 3. scale data but don't overwrite raw data
    # 4. return data and labels
    scaler = StandardScaler()
    scaler.fit(wineDataFrame)
    return pd.DataFrame(scaler.transform(wineDataFrame), columns=wineDataFrame.columns), quality

wineData_scaled, quality = preprocess(wineData_raw)
k = 6
model = cluster(wineData_scaled, k)
`;

export const completeWithoutDroppingWine = `
def preprocess(wineDataFrame):
    # 1. drop "Wine" column which just assigns a number (1, 2, ...) to each wine
    # It is okay to modify wineDataFrame
    
    # 2. split into data and labels. It is okay to modify wineDataFrame.
    quality = wineDataFrame["quality"]
    wineDataFrame.drop("quality", axis=1, inplace=True)

    # 3. scale data but don't overwrite raw data
    # 4. return data and labels
    scaler = StandardScaler()
    scaler.fit(wineDataFrame)
    return pd.DataFrame(scaler.transform(wineDataFrame), columns=wineDataFrame.columns), quality

wineData_scaled, quality = preprocess(wineData_raw)
k = 6
model = cluster(wineData_scaled, k)
`;
