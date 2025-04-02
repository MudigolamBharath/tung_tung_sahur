import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Bot, X, Send } from "lucide-react";
import { Pose, Results, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface Exercise {
  [key: string]: string[];
}

const exercises: Exercise = {
  Strength: ["Pushups", "Squats", "Pull-ups"],
  Arms: ["Curls"],
  Core: ["Plank"],
  Cardio: ["Jumping Jacks"]
};

const Workout: React.FC = () => {
  const [exercise, setExercise] = useState<string>("Pushups");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [repCount, setRepCount] = useState<number>(0);
  const [incorrectRepCount, setIncorrectRepCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [targetReps, setTargetReps] = useState<number>(12);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [totalSets, setTotalSets] = useState<number>(3);
  const [isSetComplete, setIsSetComplete] = useState<boolean>(false);
  const [isExerciseComplete, setIsExerciseComplete] = useState<boolean>(false);

  const availableReps = [9, 12, 15];
  const availableSets = [1, 2, 3, 4, 5];

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const animationFrameRef = useRef<number>(0);
  const prevLandmarksRef = useRef<{[key: number]: [number, number]}>({});
  const lastPositionRef = useRef<string>("neutral");
  const debounceTimerRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const plankStartTimeRef = useRef<number | null>(null);
  const correctRepBufferRef = useRef<number>(0);

  const handleRepsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetReps(Number(event.target.value));
    resetExercise();
  };

  const handleSetsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTotalSets(Number(event.target.value));
    resetExercise();
  };

  const resetExercise = () => {
    setRepCount(0);
    setCurrentSet(1);
    setIsSetComplete(false);
    setIsExerciseComplete(false);
    setIncorrectRepCount(0);
    setFeedback([]);
    correctRepBufferRef.current = 0;
  };

  const calculateAngle = useCallback((a: [number, number], b: [number, number], c: [number, number]): number => {
    const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    return angle > 180.0 ? 360 - angle : angle;
  }, []);

  const smoothLandmarks = useCallback((landmarks: any, alpha: number = 0.5) => {
    const smoothed: {[key: number]: [number, number]} = {};
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      if (lm.visibility > 0.3) {
        if (i in prevLandmarksRef.current) {
          const [prevX, prevY] = prevLandmarksRef.current[i];
          smoothed[i] = [
            alpha * prevX + (1 - alpha) * lm.x,
            alpha * prevY + (1 - alpha) * lm.y
          ];
        } else {
          smoothed[i] = [lm.x, lm.y];
        }
      }
    }
    prevLandmarksRef.current = smoothed;
    return smoothed;
  }, []);

  const checkMistakes = useCallback((landmarks: any, exerciseType: string): string[] => {
    const mistakes: string[] = [];
    const lm = landmarks;

    switch (exerciseType) {
      case "Squats":
        const kneeAngle = calculateAngle(
          [lm[23].x, lm[23].y],  // LEFT_HIP
          [lm[25].x, lm[25].y],  // LEFT_KNEE
          [lm[27].x, lm[27].y]   // LEFT_ANKLE
        );
        if (kneeAngle < 50) mistakes.push("Knees too far forward");
        else if (kneeAngle > 130) mistakes.push("Knees not bent enough");

        const backAngle = calculateAngle(
          [lm[11].x, lm[11].y],  // LEFT_SHOULDER
          [lm[23].x, lm[23].y],  // LEFT_HIP
          [lm[27].x, lm[27].y]   // LEFT_ANKLE
        );
        if (backAngle < 140) mistakes.push("Keep your back straight");
        break;

      case "Pushups":
        const elbowAngle = calculateAngle(
          [lm[11].x, lm[11].y],  // LEFT_SHOULDER
          [lm[13].x, lm[13].y],  // LEFT_ELBOW
          [lm[15].x, lm[15].y]   // LEFT_WRIST
        );
        if (elbowAngle < 60) mistakes.push("Elbows too wide");
        else if (elbowAngle > 120) mistakes.push("Elbows too narrow");

        const hipAngle = calculateAngle(
          [lm[11].x, lm[11].y],  // LEFT_SHOULDER
          [lm[23].x, lm[23].y],  // LEFT_HIP
          [lm[25].x, lm[25].y]   // LEFT_KNEE
        );
        if (hipAngle < 140) mistakes.push("Keep your hips up");
        break;

      case "Plank":
        const torsoAngle = calculateAngle(
          [lm[11].x, lm[11].y],  // LEFT_SHOULDER
          [lm[23].x, lm[23].y],  // LEFT_HIP
          [lm[25].x, lm[25].y]   // LEFT_KNEE
        );
        if (torsoAngle < 160) mistakes.push("Hips too high");
        else if (torsoAngle > 190) mistakes.push("Hips too low");
        break;

      case "Curls":
        const elbowAngleCurls = calculateAngle(
          [lm[11].x, lm[11].y],  // LEFT_SHOULDER
          [lm[13].x, lm[13].y],  // LEFT_ELBOW
          [lm[15].x, lm[15].y]   // LEFT_WRIST
        );
        const shoulderAngle = calculateAngle(
          [lm[12].x, lm[12].y],  // RIGHT_SHOULDER
          [lm[14].x, lm[14].y],  // RIGHT_ELBOW
          [lm[16].x, lm[16].y]   // RIGHT_WRIST
        );

        const isArmExtended = elbowAngleCurls > 150;
        const isArmCurled = elbowAngleCurls < 50;
        const isShoulderStable = shoulderAngle < 25;

        if (isArmExtended && lastPositionRef.current === "down") {
          lastPositionRef.current = "up";
        } else if (isArmCurled && lastPositionRef.current === "up" && isShoulderStable) {
          lastPositionRef.current = "down";
        }

        if (!isArmExtended && lastPositionRef.current === "up") {
          mistakes.push("Extend your arm fully at the bottom");
        }
        if (!isArmCurled && lastPositionRef.current === "down") {
          mistakes.push("Curl the weight closer to your shoulder");
        }
        if (!isShoulderStable) {
          mistakes.push("Keep your upper arm still against your body");
        }
        break;

      case "Jumping Jacks":
        const armAngle = calculateAngle(
          [lm[11].x, lm[11].y],  // LEFT_SHOULDER
          [lm[13].x, lm[13].y],  // LEFT_ELBOW
          [lm[15].x, lm[15].y]   // LEFT_WRIST
        );
        const legAngle = calculateAngle(
          [lm[23].x, lm[23].y],  // LEFT_HIP
          [lm[25].x, lm[25].y],  // LEFT_KNEE
          [lm[27].x, lm[27].y]   // LEFT_ANKLE
        );
        if (armAngle < 30) mistakes.push("Raise your arms higher");
        if (legAngle < 30) mistakes.push("Spread your legs wider");
        break;

      default:
        break;
    }

    return mistakes;
  }, [calculateAngle]);

  const trackRep = useCallback((exerciseType: string, landmarks: any) => {
    const mistakes = checkMistakes(landmarks, exerciseType);
    const now = Date.now();

    // Debounce to prevent multiple counts for the same rep
    if (now - debounceTimerRef.current < 1200) return;

    if (mistakes.length === 0) {
      correctRepBufferRef.current++;

      // Require 2 consecutive correct frames to count a rep
      if (correctRepBufferRef.current >= 2 && repCount < targetReps) {
        debounceTimerRef.current = now;
        correctRepBufferRef.current = 0;

        setRepCount(prev => {
          const newCount = prev + 1;
          setFeedback([`Great form! Rep ${newCount} completed!`,
                      `${targetReps - newCount} reps remaining in set ${currentSet}`]);
          return newCount;
        });
      }
    } else {
      correctRepBufferRef.current = 0;
      
      // Only increment incorrect rep count if multiple mistakes are detected
      if (mistakes.length >= 2 && mistakes.every(m => feedback.includes(m))) {
        debounceTimerRef.current = now;
        setIncorrectRepCount(prev => prev + 1);
      }
      
      setFeedback(mistakes);
    }
  }, [repCount, targetReps, currentSet, checkMistakes]);

  const trackPlank = useCallback((landmarks: any) => {
    const mistakes = checkMistakes(landmarks, "Plank");

    if (mistakes.length > 0) {
      if (plankStartTimeRef.current) {
        const duration = (Date.now() - plankStartTimeRef.current) / 1000;
        setFeedback([`Plank broken after ${duration.toFixed(1)} seconds!`].concat(mistakes));
        plankStartTimeRef.current = null;
      }
    } else if (!plankStartTimeRef.current) {
      plankStartTimeRef.current = Date.now();
      setFeedback(["Good plank form! Keep it up!"]);
    }
  }, [checkMistakes]);

  const handleSetComplete = useCallback(() => {
    if (repCount >= targetReps && !isSetComplete) {
      setIsSetComplete(true);
      setFeedback([`Great job! Set ${currentSet} completed!`]);

      if (currentSet < totalSets) {
        setTimeout(() => {
          setCurrentSet(prev => prev + 1);
          setRepCount(0);
          setIsSetComplete(false);
          setFeedback([`Starting set ${currentSet + 1} of ${totalSets}`]);
        }, 3000);
      } else {
        setIsExerciseComplete(true);
        setFeedback([`Congratulations! You've completed all ${totalSets} sets!`]);
        handleStop();
      }
    }
  }, [repCount, targetReps, currentSet, totalSets, isSetComplete]);

  useEffect(() => {
    handleSetComplete();
  }, [repCount, handleSetComplete]);

  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.save();
    canvasCtx.scale(-1, 1);
    canvasCtx.translate(-canvasElement.width, 0);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.restore();

    if (results.poseLandmarks) {
      const smoothed = smoothLandmarks(results.poseLandmarks);
      const points: {[key: number]: [number, number]} = {};

      canvasCtx.save();
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-canvasElement.width, 0);

      for (const [idx, [x, y]] of Object.entries(smoothed)) {
        points[parseInt(idx)] = [
          x * canvasElement.width,
          y * canvasElement.height
        ];
      }

      canvasCtx.lineWidth = 4;
      canvasCtx.strokeStyle = '#00FF00';
      canvasCtx.lineCap = 'round';

      for (const [start, end] of POSE_CONNECTIONS) {
        if (points[start] && points[end]) {
          canvasCtx.beginPath();
          canvasCtx.moveTo(points[start][0], points[start][1]);
          canvasCtx.lineTo(points[end][0], points[end][1]);
          canvasCtx.stroke();
        }
      }

      for (const [idx, [cx, cy]] of Object.entries(points)) {
        canvasCtx.beginPath();
        canvasCtx.arc(cx, cy, 4, 0, 2 * Math.PI);
        canvasCtx.fillStyle = '#00FF00';
        canvasCtx.fill();
      }

      canvasCtx.restore();

      // Track exercise based on type
      if (exercise === "Plank") {
        trackPlank(results.poseLandmarks);
      } else {
        trackRep(exercise, results.poseLandmarks);
      }
    }
  }, [exercise, smoothLandmarks, trackRep, trackPlank]);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    resetExercise();
    startTimeRef.current = Date.now();
    lastPositionRef.current = "neutral";
    debounceTimerRef.current = 0;
    prevLandmarksRef.current = {};

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
          videoRef.current?.play().catch(err => {
            console.error("Error playing video:", err);
            setError("Error playing video stream.");
            setIsLoading(false);
          });
          setIsLoading(false);
        };
      }
      streamRef.current = stream;

      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);
      poseRef.current = pose;

      const processFrame = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };
      processFrame();

    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Error accessing camera. Please check your permissions and try again.");
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
    setIsLoading(false);
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { role: "user", content: userInput };
    setChatMessages([...chatMessages, newMessage]);
    setUserInput("");

    try {
      const prompt = `As a fitness trainer, help me with: ${userInput}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setChatMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    }
  };

  useEffect(() => {
    return () => {
      handleStop();
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">AI Fitness Trainer</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Exercise</label>
            <select
              value={exercise}
              onChange={(e) => {
                setExercise(e.target.value);
                resetExercise();
              }}
              className="select select-bordered w-full bg-black text-blue-500"
            >
              {Object.entries(exercises).map(([category, exerciseList]) => (
                <optgroup key={category} label={category}>
                  {exerciseList.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Reps per Set</label>
            <select
              value={targetReps}
              onChange={handleRepsChange}
              className="select select-bordered w-full bg-black text-blue-500"
            >
              {availableReps.map((reps) => (
                <option key={reps} value={reps}>
                  {reps} reps
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Number of Sets</label>
            <select
              value={totalSets}
              onChange={handleSetsChange}
              className="select select-bordered w-full bg-black text-blue-500"
            >
              {availableSets.map((sets) => (
                <option key={sets} value={sets}>
                  {sets} {sets === 1 ? 'set' : 'sets'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? "Loading..." : "Start Exercise"}
          </button>
          {streamRef.current && (
            <button
              onClick={handleStop}
              className="btn btn-secondary"
            >
              Stop Camera
            </button>
          )}
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <div className="relative w-full max-w-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="hidden"
          />
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg shadow-lg border-2 border-gray-700"
          />
        </div>

        <div className="stats shadow w-full max-w-2xl bg-base-200 rounded-xl p-4 gap-4">
          <div className={`stat bg-base-300 rounded-lg p-4 ${isExerciseComplete ? 'bg-success' : ''}`}>
            <div className="stat-title text-lg font-medium text-gray-300 mb-2">Set Progress</div>
            <div className="stat-value text-4xl font-bold text-primary">
              {currentSet}/{totalSets}
              {isExerciseComplete && <span className="text-sm text-success ml-2">Completed!</span>}
            </div>
          </div>
          <div className={`stat bg-base-300 rounded-lg p-4 ${isSetComplete ? 'bg-success' : ''}`}>
            <div className="stat-title text-lg font-medium text-gray-300 mb-2">Reps in Set {currentSet}</div>
            <div className="stat-value text-4xl font-bold text-primary">
              {repCount}/{targetReps}
              {isSetComplete && <span className="text-sm text-success ml-2">Complete!</span>}
            </div>
          </div>
          <div className="stat bg-base-300 rounded-lg p-4">
            <div className="stat-title text-lg font-medium text-gray-300 mb-2">Incorrect Reps</div>
            <div className="stat-value text-4xl font-bold text-red-500">{incorrectRepCount}</div>
          </div>
          {exercise === "Plank" && plankStartTimeRef.current && (
            <div className="stat bg-base-300 rounded-lg p-4">
              <div className="stat-title text-lg font-medium text-gray-300 mb-2">Plank Time</div>
              <div className="stat-value text-4xl font-bold text-accent">
                {((Date.now() - plankStartTimeRef.current) / 1000).toFixed(1)}s
              </div>
            </div>
          )}
        </div>

        {feedback.length > 0 && (
          <div className={`alert w-full max-w-2xl ${feedback[0].includes("Good") ? 'alert-success' : 'alert-error'}`}>
            <div>
              {feedback.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleChatToggle}
          className={`fixed bottom-6 left-6 p-3 rounded-full transition-all transform hover:scale-110 shadow-lg z-50 ${isChatOpen ? 'bg-primary-500' : 'bg-gray-800'} hover:bg-primary-600`}
        >
          {isChatOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Bot className="w-6 h-6 text-primary-500" />
          )}
        </button>

        {isChatOpen && (
          <div className="fixed bottom-20 left-6 w-80 bg-black dark:bg-gray-800 rounded-lg shadow-xl z-40 transition-all transform">
            <div className="p-4 border-b dark:border-gray-700 bg-black">
              <h3 className="text-lg font-semibold text-white">AI Trainer Chat</h3>
            </div>
            <div className="h-96 overflow-y-auto p-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  <span
                    className={`inline-block p-2 rounded-lg ${msg.role === "user" ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-black"}`}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about the exercise..."
                  className="flex-1 input input-bordered dark:bg-gray-700"
                />
                <button
                  onClick={handleSendMessage}
                  className="btn btn-primary px-4"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workout;
