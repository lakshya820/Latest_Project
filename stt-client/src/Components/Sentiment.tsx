import * as io from "socket.io-client";
import { default as React, useState } from "react";

const SentimentA: React.FC = () => {
    const [sentimentAnalysisResult, setsentimentAnalysisResult] = useState<number>();


    const socket = io.connect("http://localhost:8081");


    socket.on("sentimentAnalysisResult", (data) => {
        setsentimentAnalysisResult(data);
        console.log('posresult:', data);
    });

    return (
        <React.Fragment>
            <div>
              <h5>CSI Score:</h5>
              <textarea value = {sentimentAnalysisResult}  readOnly></textarea>
          </div>
        </React.Fragment>
    );
}

export default SentimentA;