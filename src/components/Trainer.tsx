import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";


interface Exercise {
  [key: string]: string[];
}

const exercises: Exercise = {
  UpperBody: ["Pushups", "Pull ups", "Curls"],
  LowerBody: ["Squats"],
  Cardio: ["Jumping Jacks"],
  Core: ["Plank"]
};

const Trainer = () => {
  const [exercise, setExercise] = useState<string>("Pushups");
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [showWatermelon, setShowWatermelon] = useState<boolean>(false);

  const handleStart = () => {
    setIsLoading(true);
    setError(null);
    setStreamUrl(`http://localhost:8000/video_feed/?exercise=${exercise}`);
  };

  const handleStop = () => {
    setStreamUrl("");
    setIsLoading(false);
  };

  useEffect(() => {
    if (streamUrl) {
      const img = document.querySelector<HTMLImageElement>("#video-stream");
      if (!img) return;

      const handleSetComplete = (event: MessageEvent) => {
        if (event.data.type === 'set_complete') {
          setShowWatermelon(true);
          setTimeout(() => setShowWatermelon(false), 2000);
        }
      };

      window.addEventListener('message', handleSetComplete);

      img.onload = () => {
        setError(null);
        setIsLoading(false);
      };

      img.onerror = () => {
        setError("Error loading video stream. Please check your connection or try again later.");
        setStreamUrl("");
        setIsLoading(false);
      };

      return () => {
        window.removeEventListener('message', handleSetComplete);
      };
    } else {
      setIsLoading(false);
    }
  }, [streamUrl, exercise]);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { role: "user", content: userInput };
    setChatMessages((prev) => [...prev, newMessage]);
    setUserInput("");

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `You are a fitness trainer. The user is asking about ${exercise}. Here's their question: ${userInput}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setChatMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          {streamUrl ? (
            <>
              <img
                id="video-stream"
                src={streamUrl}
                alt="Exercise Stream"
                className="w-full rounded-lg shadow-lg"
              />
              <button
                onClick={handleStop}
                className="btn btn-secondary mt-4 w-full"
              >
                Stop Camera
              </button>
            </>
          ) : (
            <div className="w-full h-[500px] bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Start an exercise to begin streaming</p>
            </div>
          )}
        </div>

        <div className="w-80 space-y-4">
          <h1 className="text-3xl font-bold">AI Fitness Trainer</h1>
          
          <select
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
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

          <button
            onClick={handleStart}
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? "Loading..." : "Start Exercise"}
          </button>

          {error && <div className="text-red-500">{error}</div>}

          <button
            onClick={handleChatToggle}
            className="btn btn-secondary w-full"
          >
            {isChatOpen ? "Close Chat" : "Open Chat"}
          </button>

          {isChatOpen && (
            <div className="border rounded-lg shadow-lg p-4">
              <div className="h-64 overflow-y-auto mb-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
                  >
                    <span className="inline-block p-2 rounded-lg bg-gray-100 text-black">
                      {msg.content}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about the exercise..."
                  className="input input-bordered flex-1"
                />
                <button
                  onClick={handleSendMessage}
                  className="btn btn-primary"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trainer;