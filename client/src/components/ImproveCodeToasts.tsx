import { useEffect, useState } from "react";
import { UserCodeInfo, useWithUserCodeExamine } from "../hooks/use-with-user-code-examination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export interface ImproveCodeHint{
    message: string,
    active: (userCodeInfo: UserCodeInfo) => boolean
}

export function ImproveCodeToasts(){
    const improveCodeHints: ImproveCodeHint[] = [
        {
            message: "You are currently using a dummy classifier model, try a real one! (Naive Bayes, Logistic Regression, etc.)",
            active: (userCodeInfo) =>{
                return userCodeInfo.classifierModelUsed === "DUMMY"
            }
        },
        {
            message: "You are currently using a Hashing Vectorizer to extract your datas features, maybe try out some other methods. (TF-IDF, Vector Count, etc.)",
            active: (userCodeInfo) =>{
                return userCodeInfo.featureExtractionUsed === "HASHING"
            }
        },
        {
            message: "Your data is currently polluted with stopwords, it may be benifical to remove these from your dataset.",
            active: (userCodeInfo) =>{
                return !userCodeInfo.removesStopwords
            }
        },
        {
            message: "Consider using TF-IDF as your feature extractor.",
            active: (userCodeInfo) =>{
                return userCodeInfo.featureExtractionUsed === "COUNT_VECTORIZER"
            }
        },
        {
            message: "Consider giving the Logistical Regression model a try!",
            active: (userCodeInfo) =>{
                return userCodeInfo.classifierModelUsed === "NAIVE_BAYES";
            }
        },
        {
            message: "Your classifier is working very well! Do you want to submit this or keep playing with it?",
            active: ()=>{
                return true
            }
        }
    ]

    const [hintDisplayed, setHintDisplayed] = useState(false);
    const {userCodeInfo} = useWithUserCodeExamine();
    function getFirstActiveHint(userCodeInfo: UserCodeInfo): ImproveCodeHint{
        console.log(userCodeInfo)
        const activeHints = improveCodeHints.filter((hint)=>hint.active(userCodeInfo));
        console.log(activeHints)
        return activeHints[0];
    }
    console.log(userCodeInfo)

    useEffect(()=>{
        if(userCodeInfo.loadStatus === "LOADING" || hintDisplayed){
          return;
        }
        toast(getFirstActiveHint(userCodeInfo).message, {position:"bottom-left", autoClose: 10000});
        setHintDisplayed(true);
      }, [userCodeInfo])

    return(
        <ToastContainer />   
    )
}