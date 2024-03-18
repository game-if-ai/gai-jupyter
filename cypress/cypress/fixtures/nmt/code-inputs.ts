/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export const useFitOnTextsTokenize = `
def preprocess(x, x_tokenizer, y, y_tokenizer):
    raw_x = tokenize_and_pad(x_tokenizer, x)
    raw_y = tokenize_and_pad(y_tokenizer, y)
    print("X Raw Shape: %s"%(raw_x.shape,))
    print("Y Raw Shape: %s"%(raw_y.shape,))
    raise Exception("preprocess function not complete")

def tokenize_and_pad(tokenizer, x):
    tokenizer.fit_on_texts(x)
    raise Exception("tokenize_and_pad function not implemented")

def output_to_text(output_logits, tokenizer):
    index_to_words = create_word_lookup_dict(tokenizer.word_index)     
    raise Exception("output_to_text function not implemented")

def create_word_lookup_dict(word_index):
    raise Exception("create_word_lookup_dict function not implemented")

`;

export const useTextToSequences = `

def preprocess(x, x_tokenizer, y, y_tokenizer):
    raw_x = tokenize_and_pad(x_tokenizer, x)
    raw_y = tokenize_and_pad(y_tokenizer, y)
    print("X Raw Shape: %s"%(raw_x.shape,))
    print("Y Raw Shape: %s"%(raw_y.shape,))
    raise Exception("preprocess function not complete")

def tokenize_and_pad(tokenizer, x):
    tokenizer.fit_on_texts(x)
    return pad_sequences(tokenizer.texts_to_sequences(x), padding='post')

def output_to_text(output_logits, tokenizer):
    index_to_words = create_word_lookup_dict(tokenizer.word_index)     
    raise Exception("output_to_text function not implemented")

def create_word_lookup_dict(word_index):
    raise Exception("create_word_lookup_dict function not implemented")
`;

export const usePadSequences = `
def preprocess(x, x_tokenizer, y, y_tokenizer):
    raw_x = tokenize_and_pad(x_tokenizer, x)
    raw_y = tokenize_and_pad(y_tokenizer, y)
    print("X Raw Shape: %s"%(raw_x.shape,))
    print("Y Raw Shape: %s"%(raw_y.shape,))
    raw_x = pad_sequences(raw_x, padding='post', maxlen=raw_y.shape[1])
    raise Exception("preprocess function not complete")

def tokenize_and_pad(tokenizer, x):
    tokenizer.fit_on_texts(x)
    return pad_sequences(tokenizer.texts_to_sequences(x), padding='post')

def output_to_text(output_logits, tokenizer):
    index_to_words = create_word_lookup_dict(tokenizer.word_index)     
    raise Exception("output_to_text function not implemented")

def create_word_lookup_dict(word_index):
    raise Exception("create_word_lookup_dict function not implemented")
`;

export const usesReshape = `
def preprocess(x, x_tokenizer, y, y_tokenizer):
    raw_x = tokenize_and_pad(x_tokenizer, x)
    raw_y = tokenize_and_pad(y_tokenizer, y)
    print("X Raw Shape: %s"%(raw_x.shape,))
    print("Y Raw Shape: %s"%(raw_y.shape,))
    raw_x = pad_sequences(raw_x, padding='post', maxlen=raw_y.shape[1])
    return raw_x.reshape(*raw_x.shape, 1), raw_y.reshape(*raw_y.shape, 1)

def tokenize_and_pad(tokenizer, x):
    tokenizer.fit_on_texts(x)
    return pad_sequences(tokenizer.texts_to_sequences(x), padding='post')

def output_to_text(output_logits, tokenizer):
    index_to_words = create_word_lookup_dict(tokenizer.word_index)     
    raise Exception("output_to_text function not implemented")

def create_word_lookup_dict(word_index):
    raise Exception("create_word_lookup_dict function not implemented")
`;

export const complete = `
def preprocess(x, x_tokenizer, y, y_tokenizer):
    raw_x = tokenize_and_pad(x_tokenizer, x)
    raw_y = tokenize_and_pad(y_tokenizer, y)
    print("X Raw Shape: %s"%(raw_x.shape,))
    print("Y Raw Shape: %s"%(raw_y.shape,))
    raw_x = pad_sequences(raw_x, padding='post', maxlen=raw_y.shape[1])
    return raw_x.reshape(*raw_x.shape, 1), raw_y.reshape(*raw_y.shape, 1)

def tokenize_and_pad(tokenizer, x):
    tokenizer.fit_on_texts(x)
    return pad_sequences(tokenizer.texts_to_sequences(x), padding='post')
    
def output_to_text(output_logits, tokenizer):
    index_to_words = create_word_lookup_dict(tokenizer.word_index)     
    return " ".join([index_to_words[prediction] for prediction in np.argmax(output_logits, 1)])

def create_word_lookup_dict(word_index):
    index_to_words = {id: word for word, id in word_index.items()}
    index_to_words[0] = ""

    return index_to_words
`;
