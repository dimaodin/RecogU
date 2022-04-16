import * as faceapi from "face-api.js";
import NProgress from "nprogress";
import React, { Fragment, useEffect, useRef, useState } from "react";
import Sidebar from "../components/sidebar";
import BgEffect from "../components/bgEffect";
import Button from "../components/button";
import Styles from "../styles/index.module.css";
import randomEmoji from "../utils/randomEmoji";
import { BsFillArrowUpCircleFill } from "react-icons/bs";

export default function Index() {
  const [emoji, setEmoji] = useState("");
  useEffect(() => {
    document.title = `Recog.U ${emoji} - Mood Diagnosis by A.I`;
    setEmoji(randomEmoji());
  }, [emoji]);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);

  const [msgGenderAge, setMsgGenderAge] = useState(null);
  const [currentExpression, setCurrentExpression] = useState({});

  const videoRef = useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    };

    loadModels();
  }, []);

  const [isErrorWithoutCamera, setIsErrorWithoutCamera] = useState(false);
  function startVideo() {
    NProgress.start();
    setCaptureVideo(true);

    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
        NProgress.done();
      })
      .catch((err) => {
        setIsErrorWithoutCamera(true);
        NProgress.done();
        console.error("Unfortunately, there was an error:", err);
      });
  }

  function handleVideoOnPlay() {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
          videoRef.current
        );
        const displaySize = { width: videoWidth, height: videoHeight };

        faceapi.matchDimensions(canvasRef.current, displaySize);
        // const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withAgeAndGender();
        // const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withAgeAndGender();
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();

        getGenderAge(detections);
        getExpressao(detections?.expressions, detections?.gender);

        if (detections) {
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          canvasRef &&
            canvasRef.current &&
            canvasRef.current
              .getContext("2d")
              .clearRect(0, 0, videoWidth, videoHeight);
          canvasRef &&
            canvasRef.current &&
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

          const box = resizedDetections.detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, {
            boxColor: "#9900F0",
            label:
              " 🤖 " +
              Math.round(resizedDetections.age) +
              " year old " +
              resizedDetections.gender +
              ".",
          });

          drawBox.draw(canvasRef.current);

          canvasRef &&
            canvasRef.current &&
            faceapi.draw.drawFaceLandmarks(
              canvasRef.current,
              resizedDetections
            );
        }
      }
    }, 1000);
  }

  function closeWebcam() {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  }

  function getGenderAge(data) {
    // console.log(data);
    let isMale = null;
    if (data?.gender === "female") {
      isMale = false;
    } else if (data?.gender === "male") {
      isMale = true;
    }

    let msg = "";
    if (isMale) {
      if (data.age <= 4) {
        msg = isMale ? "a baby boy," : "a baby girl,";
      } else if (data.age > 4 && data.age < 12) {
        msg = isMale ? "a little boy child," : "a little girl child,";
      } else if (data.age > 12 && data.age < 18) {
        msg = isMale ? "a boy," : "a girl,";
      } else if (data.age > 18 && data.age < 28) {
        msg = isMale ? "a young man," : "a young woman,";
      } else if (data.age > 28 && data.age < 55) {
        msg = isMale ? "a man," : "a woman,";
      } else if (data.age > 55) {
        msg = isMale ? "an old gentleman," : "an old lady,";
      }

      msg = `You look like ${msg}`;
    }

    setMsgGenderAge(msg);
  }

  function getExpressao(data, gender) {
    const isMale = gender === "female" ? false : true;

    let maxProp = null;
    let maxValue = -1;
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        var value = data[prop];
        if (value > maxValue) {
          maxProp = prop;
          maxValue = value;
        }
      }
    }

    let expression =
      "There is no definite expression that is see.<br/>Are you right there? 👻";
    setCurrentBackground(0);
    if (maxProp === "angry") {
      expression = "that feels angry.<br/>Let's fight! 😡";
      setCurrentBackground(1);
    } else if (maxProp === "disgusted") {
      expression = "that is disgusted.<br/>What did you see? 🤮";
      setCurrentBackground(2);
    } else if (maxProp === "fearful") {
      expression = "that feels scared, why? i'm starting to feel it too 😱";
      setCurrentBackground(3);
    } else if (maxProp === "happy") {
      expression = "that feels happy! I'm glad to see that. 😀";
      setCurrentBackground(4);
    } else if (maxProp === "neutral") {
      expression = "that looks neutral. 😶";
      setCurrentBackground(5);
    } else if (maxProp === "sad") {
      expression = "that feels sad, cheer up please 😞";
      setCurrentBackground(6);
    } else if (maxProp === "surprised") {
      expression = "that is surprised, what's so shocking? 😯";
      setCurrentBackground(7);
    }

    if (maxValue <= 0.8 && !expression.includes("neutral")) {
      if (expression.includes("it is")) {
        expression = expression.replace("it is", "it's a little");
      }
    }

    if (maxValue >= 0.999) {
      if (expression.includes("it is") && !expression.includes("neutral")) {
        expression = expression.replace("it is", "it is very");
      }
    }

    setCurrentExpression({ express: expression, spot: maxValue });
  }

  const [backgrounds] = useState([
    "#F3F3F3",
    "#A62525",
    "#3E9057",
    "#022f88",
    "#F6D710",
    "#F3F3F3",
    "#5a5a5a",
    "#FF51FF",
  ]);

  const [currentBackground, setCurrentBackground] = useState(0);

  return (
    <Fragment>
      <BgEffect captureVideo={captureVideo} />
      <Sidebar />
      <section
        className={`${Styles.container} ${Styles.backgroundTransition}`}
        style={{ backgroundColor: backgrounds[currentBackground] }}
      >
        {isErrorWithoutCamera === true && (
          <div className={`${Styles.diagnosis} ${Styles.centerDiv}`}>
            <span>Looks like there was an error with your camera 😥</span>
          </div>
        )}

        {captureVideo && modelsLoaded ? (
          <Fragment></Fragment>
        ) : (
          <div className={Styles.customButton} onClick={() => startVideo()}>
            <Button
              text={"Activate expression detector"}
              url={""}
              isNewTab={false}
              Svg=""
            />
          </div>
        )}

        {captureVideo ? (
          modelsLoaded && (
            <section className={Styles.webcamOn}>
              <div
                className={Styles.customButton}
                onClick={() => closeWebcam()}
              >
                <Button
                  text={"Disable expression detector"}
                  url={""}
                  isNewTab={false}
                  Svg=""
                />
              </div>
              <div className={Styles.contentWrap}>
                <div className={Styles.webcamWrap}>
                  <video
                    ref={videoRef}
                    height={videoHeight}
                    width={videoWidth}
                    onPlay={handleVideoOnPlay}
                  />
                  <canvas ref={canvasRef} />
                </div>

                {currentExpression.express && (
                  <div className={Styles.diagnosis}>
                    <span>{msgGenderAge}</span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: currentExpression.express,
                      }}
                    ></span>
                  </div>
                )}
              </div>
            </section>
          )
        ) : (
          <div className={`${Styles.diagnosis} ${Styles.diagnosisOff}`}>
            <span>
              <BsFillArrowUpCircleFill />
              <br />
              Connect your webcam and
              <br />
              click the button above to start {emoji}
            </span>
          </div>
        )}
      </section>
    </Fragment>
  );
}
