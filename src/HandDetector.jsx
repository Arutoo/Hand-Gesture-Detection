import { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

function isThumbAndIndexExtended(landmarks) {

  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const thumbMCP = landmarks[2];

  const indexTip = landmarks[8];
  const indexPIP = landmarks[6];

  const indexExtended = indexTip.y < indexPIP.y;

  const thumbExtended =
    Math.abs(thumbTip.x - thumbMCP.x) >
    Math.abs(thumbIP.x - thumbMCP.x);
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

export default function HandDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2, // detect both hands
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks, index) => {

        const handedness = results.multiHandedness[index].label;

        if (!isThumbAndIndexExtended(landmarks)) {
            return;
        }

        drawConnectors(ctx, landmarks, HAND_CONNECTIONS);
        drawLandmarks(ctx, landmarks);

         const fingerX = landmarks[8].x;

         if (fingerX < 0.4) {
            console.log(handedness + " LEFT");
         } 
        else if (fingerX > 0.6) {
         console.log(handedness + " RIGHT");
        }

        });
      }

      ctx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />

      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          border: "2px solid black",
        }}
      />
    </div>
  );
}