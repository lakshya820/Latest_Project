const express = require("express");
const speech = require("@google-cloud/speech");
const knex = require('knex');
require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
  },
});

// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Imports the fs library to establish file system
const fs = require('fs');

//use logger
const logger = require("morgan");

//use body parser
const bodyParser = require("body-parser");

//use corrs
const cors = require("cors");

//use openAI
const {OpenAI} = require("openai")

const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
app.use(logger("dev"));

app.use(bodyParser.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

//TODO: Create this file in the server directory of the project
process.env.GOOGLE_APPLICATION_CREDENTIALS = "./speech-to-text-key.json";

const speechClient = new speech.SpeechClient();

const openai = new OpenAI({
  apiKey: '' // This is also the default, can be omitted
});

const videoFileMap={
  'cdn':'videos/cdn.mp4',
}

const client = new language.LanguageServiceClient();


let finalTranscription = ''; // Variable to store final transcription
let grammarResult = '';
let grammarCorrectionResult = '';
let sentimentResult;
let sentimentAnalysedResult;
let posResult = [];
let posDetectionResult = [];
let grammarArray = [];
let sentimentArray = [];
let sentimentSentenceResult;
let response;
let sentimentScore=0;
let grammarScore;
let countIncorr;
let countCorr;
const jsonObject = {
  
    "inputMode": "Text",
    "sessionId": "211125404115362",
    "inputTranscript": "I love to cook chicken butter masala and hyderabadi dum biryani",
    "interpretations": [
      {
        "interpretationSource": "Lex",
        "nluConfidence": 1.0,
        "intent": {
          "confirmationState": "None",
          "name": "QuestionIntent",
          "slots": {
            "Question_1": {
              "shape": "Scalar",
              "value": {
                "originalValue": "I am a chef from bangalore",
                "resolvedValues": [],
                "interpretedValue": "I am a chef from bangalore"
              }
            },
            "Question_2": {
              "shape": "Scalar",
              "value": {
                "originalValue": "There are several cuisines I love but most of all I love to cook Indian dishes.",
                "resolvedValues": [],
                "interpretedValue": "There are several cuisines I love but most of all I love to cook Indian dishes."
              }
            },
            "Question_3": {
              "shape": "Scalar",
              "value": {
                "originalValue": "I love to cook biryani, chicken butter masala and Indian sweets",
                "resolvedValues": [],
                "interpretedValue": "I love to cook biryani, chicken butter masala and Indian sweets"
              }
            },
            "Question_4": {
              "shape": "Scalar",
              "value": {
                "originalValue": "I love to cook chicken butter masala and hyderabadi dum biryani",
                "resolvedValues": [],
                "interpretedValue": "I love to cook chicken butter masala and hyderabadi dum biryani"
              }
            }
          },
          "state": "InProgress"
        }
      }
    ],
    "bot": {
      "aliasId": "TSTALIASID",
      "aliasName": "TestBotAlias",
      "name": "BotIntract_In",
      "version": "DRAFT",
      "localeId": "en_IN",
      "id": "ADXOWVUPAZ"
    },
    "responseContentType": "text/plain; charset=utf-8",
    "sessionState": {
      "originatingRequestId": "7dffc2d0-da9b-46aa-83af-329e3a249fa1",
      "sessionAttributes": {
        "user_name": "Abhinash",
        "Question_2": "What type of cuisine do you specialize in as a chef from Bangalore?",
        "Question_3": "What is your favorite type of cuisine to cook, and what makes it stand out from other cuisines?",
        "Question_4": "What are some of your favorite Indian dishes to cook?"
      },
      "activeContexts": [],
      "intent": {
        "confirmationState": "None",
        "name": "QuestionIntent",
        "slots": {
          "Question_1": {
            "shape": "Scalar",
            "value": {
              "originalValue": "I am a chef from bangalore",
              "resolvedValues": [],
              "interpretedValue": "I am a chef from bangalore"
            }
          },
          "Question_2": {
            "shape": "Scalar",
            "value": {
              "originalValue": "There are several cuisines I love but most of all I love to cook Indian dishes.",
              "resolvedValues": [],
              "interpretedValue": "There are several cuisines I love but most of all I love to cook Indian dishes."
            }
          },
          "Question_3": {
            "shape": "Scalar",
            "value": {
              "originalValue": "I love to cook biryani, chicken butter masala and Indian sweets",
              "resolvedValues": [],
              "interpretedValue": "I love to cook biryani, chicken butter masala and Indian sweets"
            }
          },
          "Question_4": {
            "shape": "Scalar",
            "value": {
              "originalValue": "I love to cook chicken butter masala and hyderabadi dum biryani",
              "resolvedValues": [],
              "interpretedValue": "I love to cook chicken butter masala and hyderabadi dum biryani"
            }
          }
        },
        "state": "InProgress"
      }
    },
    "messageVersion": "1.0",
    "invocationSource": "DialogCodeHook"
  
};


app.get('/videos/:filename', (req, res)=>{
  const fileName = req.params.filename;
  const filePath = videoFileMap[fileName]
  if(!filePath){
      return res.status(404).send('File not found')
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if(range){
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, {start, end});
      const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4'
      };
      res.writeHead(206, head);
      file.pipe(res);
  }
  else{
      const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4'
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res)
  }
})



io.on("connection", (socket) => {
  let recognizeStream = null;
  console.log("** a user connected - " + socket.id + " **\n");

  socket.on("disconnect", () => {
    console.log("** user disconnected ** \n");
  });

  socket.on("send_message", (message) => {
    console.log("message: " + message);
    setTimeout(() => {
      io.emit("receive_message", "got this message" + message);
    }, 1000);
  });

  socket.on("startGoogleCloudStream", function (data) {
    startRecognitionStream(this, data);
  });

  socket.on("endGoogleCloudStream", async () => {
    console.log("** ending google cloud stream **\n");
    stopRecognitionStream();
    //grammarCorrectionResult = await grammarcorrection(finalTranscription);
    //posDetectionResult = await pos(finalTranscription);
    //sentimentAnalysedResult = await sentiment(finalTranscription);
    //sentimentSentenceResult = await sentimnetSentence(finalTranscription);
    //console.log('grammarCorrectionResult :', grammarCorrectionResult);
    //console.log('sentimentAnalysis :', sentimentAnalysedResult)
    //console.log('sentimentSentence: ', sentimentArray);
    processSlots();

    // Remove newline characters
    //if (Array.isArray(grammarCorrectionResult)) {
      //grammarCorrectionResult = grammarCorrectionResult.map(result => result.replace(/\n/g, '').trim());
    //} else {
      //console.log('grammarCorrectionResult is not an array:', grammarCorrectionResult);
    //}

    //console.log("incorrect count: " + countIncorr);
    //console.log("correct count: " + countCorr);
    //console.log("grammar count: " + grammarScore);

    //.console.log("sentimentScore:" + sentimentScore);


    //io.emit("grammarCorrectionResult", grammarCorrectionResult);
    //io.emit("posDetectionResult", posDetectionResult);
    io.emit("sentimentAnalysisResult", sentimentAnalysedResult);
    io.emit("sentimentSentenceResult", sentimentSentenceResult);

    // POST: Create movies and add them to the database
    //app.post('/', (req, res) => {
      //const { csiscore } = {
      //  sentimentAnalysedResult,s
      //};

      /*for (let i = 0; i < grammarResult.length; i += 2) {
        console.log(grammarResult.length);
        const userSentence = grammarResult[i];
        const correctedSentence = grammarResult[i + 1];

      db('grammar1')
      .insert({
          "user_sentence": userSentence,
          "corrected_sentence": correctedSentence, 
      })
      .then(() => {
          console.log('Sentence Added');
          //return res.json({ msg: 'Movie Added' });
      })
      .catch((err) => {
          console.log(err);
      });
    }*/

      app.get('/csi-data', (req, res) => {
      db.select('*')
        .from('csi')
        .where('user_id', '=', 'lakshya.anand@dxc.com')
        .then((data) => {
            //console.log(data);
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
        });
     });

     app.get('/sen-data', (req, res) => {
     db.select('*')
     .from('cbs')
     .where('user_id', '=', 'lakshya.anand@dxc.com')
     .then((data) => {
         //console.log(data);
         res.json(data);
     })
     .catch((err) => {
         console.log(err);
     });
    });

    app.get('/gram-data', (req, res) => {
      db.select('*')
      .from('grammar')
      .where('user_id', '=', 'lakshya.anand@dxc.com')
      .then((data) => {
          //console.log(data);
          res.json(data);
      })
      .catch((err) => {
          console.log(err);
      });
     });

     app.get('/perc-data', (req, res) => {
      db.select('*')
      .from('perc')
      .where('user_id', '=', 'lakshya.anand@820@gmail.com')
      .then((data) => {
          //console.log(data);
          res.json(data);
      })
      .catch((err) => {
          console.log(err);
      });
     });

     app.get('/score-data', (req, res) => {
      db.select('*')
      .from('score')
      .where('user_id', '=', 'lakshya.anand@dxc.com')
      .then((data) => {
          //console.log(data);
          res.json(data);
      })
      .catch((err) => {
          console.log(err);
      });
     });

     app.get('/score2-data', (req, res) => {
      db.select('*')
      .from('score2')
      .where('user_id', '=', 'lakshya.anand@dxc.com')
      .then((data) => {
          //console.log(data);
          res.json(data);
      })
      .catch((err) => {
          console.log(err);
      });
     });
  });

  socket.on("send_audio_data", async (audioData) => {
    io.emit("receive_message", "Got audio data");
    if (recognizeStream !== null) {
      try {
        recognizeStream.write(audioData.audio);
      } catch (err) {
        console.log("Error calling google api " + err);
      }
    } else {
      console.log("RecognizeStream is null");
    }
  });

  function startRecognitionStream(client) {
    console.log("* StartRecognitionStream\n");
    try {
      recognizeStream = speechClient
        .streamingRecognize(request)
        .on("error", console.error)
        .on("data", (data) => {
          const result = data.results[0];
          const isFinal = result.isFinal;

          const transcription = data.results
            .map((result) => result.alternatives[0].transcript)
            .join("\n");

          //console.log(`Transcription: `, transcription);

          if (isFinal) {
            // Append the final transcription to the variable
            finalTranscription += transcription + '\n';
          }

          
         
          client.emit("receive_audio_text", {
            text: transcription,
            isFinal: isFinal,
          });

          // if end of utterance, let's restart stream
          // this is a small hack to keep restarting the stream on the server and keep the connection with Google api
          // Google api disconects the stream every five minutes
          if (data.results[0] && data.results[0].isFinal) {
            stopRecognitionStream();
            startRecognitionStream(client);
            console.log("restarted stream serverside");
          }
        });
    } catch (err) {
      console.error("Error streaming google api " + err);
    }
  }
  

  function stopRecognitionStream() {
    if (recognizeStream) {
      console.log("* StopRecognitionStream \n");
      //console.log("Final Transcription: ", finalTranscription);
      recognizeStream.end();
    }
    recognizeStream = null;
  }

  async function processSlots() {
    const slots = jsonObject.sessionState.intent.slots;
  
    for (const slotKey in slots) {
      if (slots.hasOwnProperty(slotKey)) {
        const interpretedValue = slots[slotKey].value.interpretedValue;
        const correctedGrammar = await grammarcorrection(interpretedValue);
        console.log(`Original: ${interpretedValue}`);
        console.log(`Corrected: ${correctedGrammar}`);
        io.emit("grammarCorrectionResult", correctedGrammar);
      }
    }
  }
  
  async function grammarcorrection(grammar, client){
    //const correction = async (grammar) => {
      //console.log('User text:', grammar);
      try {
          const completion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                  {
                    "role": "system",
                    "content": "You will be provided with statements, and your task is to convert them to standard English."
                  },
                  {
                    "role": "user",
                    "content": grammar
                  }
                ],
              //prompt: `Correct this to standard English:\n\n${req.body.userText}.`,
              temperature: 0,
              max_tokens: 60,
              top_p: 1.0,
              frequency_penalty: 0.0,
              presence_penalty: 0.0,
          });
          
          grammarResult =  completion.choices[0].message.content;
          grammarResult = grammarResult.split('.').map(sentence => sentence.replace(/\n/g, '').trim()).filter(Boolean).join('. ');
          
          /*const correct = grammarResult.split(".");
          const incorrect = grammar.split(".");
          countCorr=0;
          countIncorr = incorrect.length-1;
            

          for (let i = 0; i < incorrect.length - 1; i++) {
            const trimmedCorrect = correct[i].trim();
            const trimmedIncorrect = incorrect[i].trim();
      
            if (trimmedCorrect !== trimmedIncorrect) {
              console.log("Testing output:" + trimmedIncorrect);
              countCorr++;
              grammarArray.push(trimmedIncorrect);
              grammarArray.push(trimmedCorrect);
            }
          }*/
           
          //grammarScore = 100-((countCorr/countIncorr)*100);
          
        /*  res.send({
              "status": 200,
              "message": completion.data.choices[0].text
          });*/

      } catch (error) {
          console.log("error", `Something happened! like: ${error}`);
          next(error);
      }

      //console.log('Response:', grammarResult);
     
      return grammarResult;
  };

  async function pos(pos){
    const text = pos;

    // Prepares a document, representing the provided text
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    // Need to specify an encodingType to receive word offsets
    const encodingType = 'UTF8';

    // Detects the syntax of the document
    const [syntax] = await client.analyzeSyntax({document, encodingType});

    console.log('Tokens:');

    syntax.tokens.forEach(part => {
      console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
    });

    syntax.tokens.forEach(part => {
      posResult.push(`${part.partOfSpeech.tag}: ${part.text.content}`);
    });

    return posResult;
  }

  async function sentiment(sentimentText){
    const text = sentimentText;
    // Prepares a document, representing the provided text
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    // Detects sentiment of entities in the document
    const [result] = await client.analyzeSentiment({document});
    //const entities = result.entities;

    const sentiment = result.documentSentiment;
    //console.log('Document sentiment:');
    //console.log(`  Score: ${sentiment.score}`);
    //console.log(`  Magnitude: ${sentiment.magnitude}`);

    const sentences = result.sentences;
    //sentences.forEach(sentence => {
    //console.log(`Sentence: ${sentence.text.content}`);
    //console.log(`  Score: ${sentence.sentiment.score}`);
    //console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
    //});
    sentimentResult = sentiment.score;
  
    sentimentScore=sentimentResult*100;
    
    return sentimentResult*5;
  }

  async function sentimnetSentence(Sentence){
    const text = Sentence;
    // Prepares a document, representing the provided text
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    // Detects sentiment of entities in the document
    const [result] = await client.analyzeSentiment({document});
    //const entities = result.entities;

    const sentiment = result.documentSentiment;
    /*console.log('Document sentiment:');
    console.log(`  Score: ${sentiment.score}`);
    console.log(`  Magnitude: ${sentiment.magnitude}`);
    */

    const sentences = result.sentences;
    sentences.forEach(sentence => {
    sentimentArray.push(`Sentence: ${sentence.text.content}`);
    sentimentArray.push(`  Score: ${sentence.sentiment.score*5}`);
    //console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);

  
    });

    return sentimentArray;
  }
}
//}
);

server.listen(8081, () => {
  console.log("WebSocket server listening on port 8081.");
});

// =========================== GOOGLE CLOUD SETTINGS ================================ //

// The encoding of the audio file, e.g. 'LINEAR16'
// The sample rate of the audio file in hertz, e.g. 16000
// The BCP-47 language code to use, e.g. 'en-US'
const encoding = "LINEAR16";
const sampleRateHertz = 16000;
const languageCode = "ko-KR"; //en-US
const alternativeLanguageCodes = ["en-US", "ko-KR"];

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: "en-US",
    //alternativeLanguageCodes: alternativeLanguageCodes,
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
    enableSpeakerDiarization: true,
    //diarizationSpeakerCount: 2,
    //model: "video",
    model: "command_and_search",
    //model: "default",
    useEnhanced: true,
  },
  interimResults: true,
};
