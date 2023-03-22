import { useEffect, useState } from "react";
import { UserInputCellsCode, useWithCellOutputs } from "./use-with-cell-outputs";

type ClassifierModel = "NAIVE_BAYES" | "LOGISTIC_REGRESSION" | "DUMMY" | "NONE";
type FeatureExtractionMethods = "HASHING" | "TFIDF" | "COUNT_VECTORIZER" | "NONE";
type LoadStatus = "LOADING" | "LOADED"

export interface UserCodeInfo{
    usingLemmatization: boolean;
    removesStopwords: boolean;
    cleansContractions: boolean;
    classifierModelUsed: ClassifierModel;
    featureExtractionUsed: FeatureExtractionMethods,
    loadStatus: LoadStatus
}

export function useWithUserCodeExamine(){
    const {userInputCellsCode: userCode} = useWithCellOutputs();

    const [userCodeInfo, setUserCodeInfo] = useState<UserCodeInfo>({
        usingLemmatization: false,
        classifierModelUsed: "NONE",
        featureExtractionUsed: "NONE",
        removesStopwords: false,
        cleansContractions: false,
        loadStatus: "LOADING"
    });

    useEffect(()=>{
        if(Object.keys(userCode).length === 0){
            return;
        }
        const allUserInputCode = Object.values(userCode).flat();
        setUserCodeInfo({
            usingLemmatization: isUsingLemmatization(allUserInputCode),
            classifierModelUsed: getClassifierModelUsed(allUserInputCode),
            featureExtractionUsed: getFeatureExtractionMethodUsed(allUserInputCode),
            removesStopwords: isRemovingStopwords(allUserInputCode),
            cleansContractions: isCleaningContractions(allUserInputCode),
            loadStatus: "LOADED"
        })
    }, [userCode])

    function isUsingLemmatization(userCode: string[]): boolean{
        const importsLemmatizer = Boolean(userCode.find((codeLine)=>codeLine.match(/import.*WordNetLemmatizer/)));
        const usesLemmatizer = Boolean(userCode.find((codeLine)=>codeLine.match(/lemmatize\(.+\)/)));
        return importsLemmatizer && usesLemmatizer;
    }

    function isRemovingStopwords(userCode: string[]): boolean{
        const importsStopwords = Boolean(userCode.find((codeLine)=>codeLine.match(/import.*stopwords/)));
        const initializesStopwords = Boolean(userCode.find((codeLine)=>codeLine.match(/stopwords.words\(.*\)/)));
        return importsStopwords && initializesStopwords;
    }

    function isCleaningContractions(userCode: string[]): boolean{
        const importsContractions = Boolean(userCode.find((codeLine)=>codeLine.match(/import.*contractions/)));
        const usesContractionsFix = Boolean(userCode.find((codeLine)=>codeLine.match(/contractions.fix\(.+\)/)));
        return importsContractions && usesContractionsFix
    }

    function getFeatureExtractionMethodUsed(userCode: string[]): FeatureExtractionMethods{
        const usesHashing = Boolean(userCode.find((codeLine)=>codeLine.match(/HashingVectorizer\(.*\)/)));
        const usesTfidf = Boolean(userCode.find((codeLine)=>codeLine.match(/TfidfVectorizer\(.*\)/)));
        const usesCounting = Boolean(userCode.find((codeLine)=>codeLine.match(/CountVectorizer\(.*\)/)));
        return usesHashing ? "HASHING" : usesTfidf ? "TFIDF" : usesCounting ? "COUNT_VECTORIZER" : "NONE";
    }
        

    function getClassifierModelUsed(userCode: string[]): ClassifierModel{
        const usesLogisticRegression = Boolean(userCode.find((codeLine)=>codeLine.match(/LogisticRegression\(.*\)/)));
        const usesNiavesBay = Boolean(userCode.find((codeLine)=>codeLine.match(/MultinomialNB\(.*\)/)));
        const usesDummy = Boolean(userCode.find((codeLine)=>codeLine.match(/DummyClassifier\(.*\)/)));
        return usesLogisticRegression ? "LOGISTIC_REGRESSION" :usesNiavesBay? "NAIVE_BAYES": usesDummy ? "DUMMY" :"NONE";
    }


    return{
        userCodeInfo
    }
}