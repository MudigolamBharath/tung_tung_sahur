import { useState, useEffect } from "react";
import './Trainer.css';
import { GoogleGenerativeAI } from "@google/generative-ai";

const exercises = {
    Abs: ["Crunches", "Situps", "Plank", "Mountain Climber", "Side Bridges"],
    Arms: ["Curls", "Bench Press", "Skull Crushers", "Overhead Extensions", "Shoulder Press"],
    Chest: ["Pushups", "Inclined Dumbell Press"],
    Legs: ["Squats", "Wall Sit", "Dips"],
};

const Trainer = () => {
    const [exercise, setExercise] = useState("Pushups");
    const [streamUrl, setStreamUrl] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [userInput, setUserInput] = useState("");

    const handleStart = () => {
        setIsLoading(true);
        setError(null);
        setStreamUrl(`http://localhost:8000/video_feed/?exercise=${exercise}`);
    };

    useEffect(() => {
        if (streamUrl) {
            const img = document.querySelector("#video-stream");

            img.onload = () => {
                setError(null);
                setIsLoading(false);
            };

            img.onerror = () => {
                setError("Error loading video stream. Please check your connection or try again later.");
                setStreamUrl("");
                setIsLoading(false);
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

        setChatMessages([...chatMessages, { text: userInput, sender: "user" }]);

        try {
            const genAI = new GoogleGenerativeAI("AIzaSyB9qWhoM8GyJXQzIV1OH20FdPqG2S9cAs4");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = userInput;
            const result = await model.generateContent(prompt);
            setChatMessages([...chatMessages, { text: userInput, sender: "user" }, { text: result.response.text(), sender: "bot" }]);
        } catch (error) {
            console.error("Error communicating with Gemini API:", error);
            setChatMessages([...chatMessages, { text: userInput, sender: "user" }, { text: "Error communicating with the AI. Please check your connection or try again later.", sender: "bot" }]);
        }

        setUserInput("");
    };

    return (
        <div className="trainer-container">
            <div className="content">
                <div className="video-section">
                    {isLoading && <p className="loading-message">Loading video stream...</p>}
                    <img
                        id="video-stream"
                        src={streamUrl}
                        alt="Exercise Stream"
                        className="video-stream"
                        style={{ display: isLoading ? 'none' : 'block' }}
                    />
                    {error && <p className="error-message">{error}</p>}
                </div>
                <div className="exercise-selection">
                    <h2 className="selection-title">Select Exercise</h2>
                    <select
                        id="exercise-select"
                        value={exercise}
                        onChange={(e) => setExercise(e.target.value)}
                        className="exercise-select"
                    >
                        {Object.entries(exercises).map(([category, exList]) => (
                            <optgroup key={category} label={category}>
                                {exList.map((ex) => (
                                    <option key={ex} value={ex}>{ex}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
    
                    <button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="start-button"
                    >
                        {isLoading ? "Loading..." : "Start Exercise"}
                    </button>
                </div>
            </div>
    
            <div className="chat-button-container">
                <button className="chat-button" onClick={handleChatToggle}>
                    <img src="/assets/ai-trainer.png" alt="AI Trainer" className="ai-trainer-icon" />
                </button>
            </div>
    
            {isChatOpen && (
                <div className="chat-window">
                    <div className="chat-messages">
                        {chatMessages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}`}>
                                {message.text}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask a gym-related question..."
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                    <button className="close-chat" onClick={handleChatToggle}>Close Chat</button>
                </div>
            )}
        </div>
    );
};

export default Trainer;