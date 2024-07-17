/* eslint-disable react-hooks/exhaustive-deps */
import { default as React, useEffect, useState, useRef } from "react";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import * as io from "socket.io-client";
import continousGif from './continous.gif';
import static_image from "./static_image.png"
import Grammar from './Grammar'
import { Sentiment } from "@aws-sdk/client-transcribe-streaming";
import SentimentA from './Sentiment'
import SentimentSentence from "./SentimentSentence";
import Results from "./Results";

const sampleRate = 16000;

const getMediaStream = () =>
  navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: "default",
      sampleRate: sampleRate,
      sampleSize: 16,
      channelCount: 1,
    },
    video: false,
  });

interface WordRecognized {
  isFinal: boolean;
  text: string;
}

interface AudioToTextProps {
  onNext: () => void; // Function to call when "Next" button is clicked
}


const AudioToText: React.FC<AudioToTextProps> = ({onNext}) => {
  const [connection, setConnection] = useState<io.Socket>();
  const [currentRecognition, setCurrentRecognition] = useState<string>();
  const [recognitionHistory, setRecognitionHistory] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recorder, setRecorder] = useState<any>();
  const processorRef = useRef<any>();
  const audioContextRef = useRef<any>();
  const audioInputRef = useRef<any>();
  const [grammarCorrectionResult, setGrammarCorrectionResult] = useState<string>();
  //const [posDetectionResult, setPosDetectionResult] = useState<string[]>([]);
  const [sentimentAnalysisResult, setsentimentAnalysisResult] = useState<number>();
  // Get references to HTML elements
  //const startButton: HTMLButtonElement | null = document.getElementById('startButton') as HTMLButtonElement;
  //const stopButton: HTMLButtonElement | null = document.getElementById('stopButton') as HTMLButtonElement;
  //const gifContainer: HTMLElement | null = document.getElementById('gifContainer');
  //const imageContainer: HTMLElement | null = document.getElementById('imageContainer');
  const [showGrammar, setShowGrammar] = useState(false);
  const [showSentimentA, setShowSentimentA] = useState(false);
  //const [nextClicked, setNextClicked] = useState(false);
  const [showSentimentSentence, setShowSentimentSentence] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  
  const speechRecognized = (data: WordRecognized) => {
    if (data.isFinal) {
      setCurrentRecognition("...");
      setRecognitionHistory((old) => [data.text, ...old]);
    } else setCurrentRecognition(data.text + "...");
  };

  
  useEffect(() => {
    console.log("\n\nrecognitionHistory", recognitionHistory);
  }, [recognitionHistory]);

  const connect = () => {
    connection?.disconnect();
    const socket = io.connect("http://localhost:8081");


    socket.on("connect", () => {
      console.log("connected", socket.id);
      setConnection(socket);
    });

    socket.emit("send_message", "hello world");

    socket.emit("startGoogleCloudStream");

    socket.on("receive_message", (data) => {
      console.log("received message", data);
    });

    socket.on("receive_audio_text", (data) => {
      speechRecognized(data);
      console.log("received audio text", data);
    });

    socket.on("disconnect", () => {
      console.log("disconnected", socket.id);
    });
  };
  

  const disconnect = () => {
    if (!connection) return;
    connection?.emit("endGoogleCloudStream");
    connection?.disconnect();
    processorRef.current?.disconnect();
    audioInputRef.current?.disconnect();
    audioContextRef.current?.close();
    setConnection(undefined);
    setRecorder(undefined);
    setIsRecording(false);
    
    const socket = io.connect("http://localhost:8081");


   /*socket.on("grammarCorrectionResult", (data) => {
      setGrammarCorrectionResult(data);
      console.log('grammaresult:', data);
    });
    */
    /*socket.on("posDetectionResult", (data) => {
      setPosDetectionResult(data);
      console.log('posresult:', data);
    });*/

    /*socket.on("sentimentAnalysisResult", (data) => {
      setsentimentAnalysisResult(data);
      console.log('posresult:', data);
    });*/

    setShowGrammar(true);
    setShowSentimentA(true);
    setShowSentimentSentence(true);
    setShowNextButton(true);
  };

  const handleNextClick = () => {
    onNext(); // Call the onNext function when "Next" button is clicked
  };

  useEffect(() => {
    (async () => {
      if (connection) {
        if (isRecording) {
          return;
        }

        const stream = await getMediaStream();

        audioContextRef.current = new window.AudioContext();

        await audioContextRef.current.audioWorklet.addModule(
          "/src/worklets/recorderWorkletProcessor.js"
        );

        audioContextRef.current.resume();

        audioInputRef.current =
          audioContextRef.current.createMediaStreamSource(stream);

        processorRef.current = new AudioWorkletNode(
          audioContextRef.current,
          "recorder.worklet"
        );

        processorRef.current.connect(audioContextRef.current.destination);
        audioContextRef.current.resume();

        audioInputRef.current.connect(processorRef.current);

        processorRef.current.port.onmessage = (event: any) => {
          const audioData = event.data;
          connection.emit("send_audio_data", { audio: audioData });
        };
        setIsRecording(true);
      } else {
        console.error("No connection");
      }
    })();
    return () => {
      if (isRecording) {
        processorRef.current?.disconnect();
        audioInputRef.current?.disconnect();
        if (audioContextRef.current?.state !== "closed") {
          audioContextRef.current?.close();
        }
      }
    };
  }, [connection, isRecording, recorder]);


  return (
    <React.Fragment>
      <Container className="main">
          <h3>
          <span className="large">Question #1</span>
          <br></br>
          <span className="medium">How would you define good communication?</span>
          <br></br>
          <br></br>

          <span className="small">Note: Please click the start button to start recording your answer.</span>
          </h3>
          
        <Container fluid className="py-5  text-light text-center ">
          <Container>
            <Button
              id="startButton"
              className={isRecording ? "btn-danger" : "btn-outline-light"}
              onClick={connect}
              disabled={isRecording}
            >
              Start
            </Button>
            <div id="gifContainer"></div>
            <Button
              id="stopButton"
              className="btn-outline-light"
              onClick={disconnect}
              disabled={!isRecording}
            >
              Stop
            </Button>

             {/* Render the "Next" button only when showNextButton is true */}
               {showNextButton && (
                <Button className="btn-outline-light" onClick={handleNextClick}>
                  Next
                </Button>
              )}

            <div id="imageContainer"></div>
          </Container>
        </Container>
        <Container className="e-card e-card-horizontal">
          <div>
          {recognitionHistory.map((tx, idx) => (
            <p key={idx}>{tx}</p>
          ))}
          <p>{currentRecognition}</p>
          </div>
          <div>
          {showNextButton && <Results></Results>}
          
          </div>
        </Container>
        <div id="results">

        </div>
      </Container>
    </React.Fragment>
  );
};

export default AudioToText;
