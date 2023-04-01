import { IOutput, isError, isStream } from "@jupyterlab/nbformat";

import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

export function Output(props:{outputs:IOutput[]}): JSX.Element{
    const {outputs} = props;

    return(
        <div>
            {outputs.map((output, i)=>{
                if(!output){
                    return <></>
                }
                if (isStream(output)){
                    const data = Array.isArray(output.text) ? output.text : [output.text]
                    return(
                        <div key={i} style={{height:"fit-content", backgroundColor:"lightyellow"}}>
                            {data.map((line)=>{
                                return(
                                    <div>
                                        {line}
                                    </div>
                                )
                            })}
                        </div>
                    )
                } else if(isError(output)){
                    return(
                        <div key={i} style={{backgroundColor:"#FFCCCB", height:"fit-content"}}>
                            {`${output.ename}`}
                            <br />
                            {`${output.evalue}`}
                        </div>
                    )
                }else{
                    const data = JSON.parse(JSON.stringify((output.data as any)["application/json"]))
                    return(
                        <div key={i} style={{height:"fit-content", backgroundColor:"lightyellow"}}>
                            <JsonView data={data} shouldInitiallyExpand={(level) => true} style={defaultStyles} />
                        </div>
                    )
                }

            })}

        </div>
    )
}
