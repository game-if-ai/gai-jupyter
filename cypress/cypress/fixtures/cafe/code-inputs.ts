/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export const useLogisticRegression = `from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression

# Preprocess First
def preprocess(docs):
    # Apply some function to each document/review in the pandas series
    # NOTE: Every x document is a sentence, with multiple words
    return docs.apply(lambda x: x)


x_train = preprocess(x_train)
x_test = preprocess(x_test)


# Pick Vectorizer
vectorizer = CountVectorizer(binary=True)
x_train_features = vectorizer.fit_transform(x_train)
x_test_features = vectorizer.transform(x_test)
def train(classifier, x, y):
    classifier.fit(x, y)


# Pick Classifier
classifier = LogisticRegression()


# Train
train(classifier,x_train_features, y_train)
`;

export const useStemming = `
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from nltk.stem.porter import PorterStemmer

def stem_input(x, stemmer):
    return " ".join([stemmer.stem(word) for word in x.split() if word not in stopwds])

# Preprocess First
def preprocess(docs):
    # Apply some function to each document/review in the pandas series
    # NOTE: Every x document is a sentence, with multiple words
    stemmer = PorterStemmer()
    return docs.apply(lambda x: stem_input(x, stemmer))


x_train = preprocess(x_train)
x_test = preprocess(x_test)


# Pick Vectorizer
vectorizer = CountVectorizer(binary=True)
x_train_features = vectorizer.fit_transform(x_train)
x_test_features = vectorizer.transform(x_test)
def train(classifier, x, y):
    classifier.fit(x, y)


# Pick Classifier
classifier = LogisticRegression()


# Train
train(classifier,x_train_features, y_train)
`;
export const complete = `
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords

stopwds = set(stopwords.words("english"))

def stem_input(x, stemmer):
    return " ".join([stemmer.stem(word) for word in x.split() if word not in stopwds])

# Preprocess First
def preprocess(docs):
    # Apply some function to each document/review in the pandas series
    # NOTE: Every x document is a sentence, with multiple words
    stemmer = PorterStemmer()
    return docs.apply(lambda x: stem_input(x, stemmer))


x_train = preprocess(x_train)
x_test = preprocess(x_test)


# Pick Vectorizer
vectorizer = CountVectorizer(binary=True)
x_train_features = vectorizer.fit_transform(x_train)
x_test_features = vectorizer.transform(x_test)
def train(classifier, x, y):
    classifier.fit(x, y)


# Pick Classifier
classifier = LogisticRegression()


# Train
train(classifier,x_train_features, y_train)
`;
