import * as io from "socket.io-client";
import { default as React, useState } from "react";

const Results: React.FC = () => {
    const [grammarCorrectionResult, setGrammarCorrectionResult] = useState<string[]>([]);


    const socket = io.connect("http://localhost:8081");


    socket.on("grammarCorrectionResult", (data) => {
      setGrammarCorrectionResult(data);
      console.log('grammaresult:', data);
    });

    return (
        <React.Fragment>
            <div>
            <h4>Overall communication proficiency: 75%</h4>
            <h4>You can imporve your communication skills by working on Sentence Formation.</h4>
          </div>
        </React.Fragment>
    );
}

export default Results;