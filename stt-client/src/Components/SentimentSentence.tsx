import * as io from "socket.io-client";
import { default as React, useState } from "react";

const SentimentSentence: React.FC = () => {
    const [sentimentSentenceResult, setSentimentSentenceResult] = useState<string[]>([]);


    const socket = io.connect("http://localhost:8081");


    socket.on("sentimentSentenceResult", (data) => {
        setSentimentSentenceResult(data);
      console.log('grammaresult:', data);
    });

    return (
        <React.Fragment>
            <div>
            <h5>Sentence Sentiment Scores</h5>
            {sentimentSentenceResult.map((result, index) => (
              <p key={index}>{result}</p>
            ))}
          </div>
        </React.Fragment>
    );
}

export default SentimentSentence;