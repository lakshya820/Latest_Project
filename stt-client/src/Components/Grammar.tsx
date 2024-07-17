import * as io from "socket.io-client";
import { default as React, useState } from "react";

const Grammar: React.FC = () => {
    const [grammarCorrectionResult, setGrammarCorrectionResult] = useState<string[]>([]);


    const socket = io.connect("http://localhost:8081");


    socket.on("grammarCorrectionResult", (data) => {
      setGrammarCorrectionResult(data);
      console.log('grammaresult:', data);
    });

    return (
        <React.Fragment>
            <div>
            <h5>Grammar Suggestion:</h5>
            {grammarCorrectionResult.map((result, index) => (
              <p key={index}>{result}</p>
            ))}
          </div>
        </React.Fragment>
    );
}

export default Grammar;