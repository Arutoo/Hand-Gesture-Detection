import { useEffect, useRef, useState} from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function isThumbAndIndexExtended(landmarks) {

  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const thumbMCP = landmarks[2];

  const indexTip = landmarks[8];
  const indexPIP = landmarks[6];

  const indexExtended = indexTip.y < indexPIP.y;

  const thumbExtended = Math.abs(thumbTip.x - thumbMCP.x) > Math.abs(thumbIP.x - thumbMCP.x);

  const middleFolded = landmarks[12].y > landmarks[10].y;
  const ringFolded = landmarks[16].y > landmarks[14].y;
  const pinkyFolded = landmarks[20].y > landmarks[18].y;

  return (
    thumbExtended &&
    indexExtended &&
    middleFolded &&
    ringFolded &&
    pinkyFolded
  );
}

export default function HandDetector({}) {
  const videoRef = useRef(null);
  const [handedness, setHandedness] = useState(null);
  const lastDetectionTime = useRef(0);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      selfieMode: true,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      const now = Date.now();

      if (now - lastDetectionTime.current < 300) return;

      if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks, index) => {

        const detectedHand = results.multiHandedness[index].label;

        if (!isThumbAndIndexExtended(landmarks)) {
            return;
        }

        setHandedness(detectedHand);
        console.log(detectedHand);
        lastDetectionTime.current = now;
        });
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      {handedness}
    </div>
  );
}