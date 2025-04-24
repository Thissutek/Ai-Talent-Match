import { useState, useEffect, useRef } from "react";
import { generateSkillVerificationQuestions } from "@/lib/ai/skillChecker";
import { saveChatSession } from "@/lib/supabase/client";
import { FiSend, FiCheckCircle } from "react-icons/fi";

export default function SkillsChat({
  candidateId,
  parsedResume,
  onChatComplete,
}) {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatCompleted, setChatCompleted] = useState(false);
  const chatEndRef = useRef(null);

  // Load initial questions based on resume
  useEffect(() => {
    async function loadInitialQuestions() {
      try {
        setIsLoading(true);
        const generatedQuestions =
          await generateSkillVerificationQuestions(parsedResume);
        setQuestions(generatedQuestions);

        // Add welcome message
        const initialMessage = {
          role: "assistant",
          content: `Hi there! I'm your AI interviewer. I'd like to ask you a few questions about your experience and skills to learn more about you. Let's get started!`,
        };

        // Add first question
        const firstQuestion = {
          role: "assistant",
          content: generatedQuestions[0].question,
        };

        setMessages([initialMessage, firstQuestion]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading initial questions:", error);
        setIsLoading(false);
      }
    }

    if (parsedResume && candidateId) {
      loadInitialQuestions();
    }
  }, [parsedResume, candidateId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate mock AI follow-up response
  const generateMockFollowUp = (userMessage, currentQuestion) => {
    // Simple follow-up responses based on the current skill being verified
    const followUps = {
      React:
        "That's interesting! Could you elaborate on how you handle component state in your React applications?",
      JavaScript:
        "Thanks for sharing. Have you worked with any JavaScript frameworks besides React?",
      CSS: "Great to know. What's your approach to responsive design and cross-browser compatibility?",
      "Performance Optimization":
        "That's a solid approach. Have you used any specific tools to measure performance improvements?",
      Adaptability:
        "Excellent learning strategy. What's the most recent technology you've learned and how did you apply it?",
    };

    // Default follow-up if skill-specific one isn't available
    const defaultFollowUp =
      "Thank you for sharing that. Could you tell me more about how you applied this in a real project?";

    // Get the skill being verified from the current question
    const skill = currentQuestion?.skillToVerify || "";

    // Return either the skill-specific follow-up or the default
    return followUps[skill] || defaultFollowUp;
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = { role: "user", content: currentMessage };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Process user response and determine next question or action
      const nextQuestionIndex = currentQuestionIndex + 1;

      // Simulate AI thinking time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (nextQuestionIndex < questions.length) {
        // For some questions, add a follow-up response first
        if (Math.random() > 0.5) {
          const followUpMessage = {
            role: "assistant",
            content: generateMockFollowUp(
              currentMessage,
              questions[currentQuestionIndex],
            ),
          };
          setMessages((prev) => [...prev, followUpMessage]);

          // Add a slight delay before asking the next question
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        // Add AI's next question
        const aiMessage = {
          role: "assistant",
          content: questions[nextQuestionIndex].question,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setCurrentQuestionIndex(nextQuestionIndex);
        setIsLoading(false);
      } else {
        // All questions answered, generate final assessment
        const finalMessage = {
          role: "assistant",
          content:
            "Thank you for answering all my questions! I'll analyze your responses and provide feedback to potential recruiters. Best of luck with your job search!",
        };

        setMessages((prev) => [...prev, finalMessage]);
        setChatCompleted(true);

        // Save the entire chat session
        await saveChatSession(candidateId, {
          questions: questions,
          messages: [...messages, userMessage, finalMessage],
        });

        // Notify parent component that chat is complete
        if (onChatComplete) {
          onChatComplete([...messages, userMessage, finalMessage]);
        }

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setIsLoading(false);

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-gray-50 rounded-lg shadow">
      {/* Chat header */}
      <div className="p-4 bg-[#00ff9d] text-black rounded-t-lg">
        <h2 className="text-xl font-semibold">Skill Assessment Chat</h2>
        <p className="text-sm opacity-80">
          Chat with our AI to assess your skills and experience
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === "user"
                ? "ml-auto max-w-3/4 bg-[#00ff9d] text-black rounded-lg rounded-tr-none p-3"
                : "mr-auto max-w-3/4 bg-gray-200 rounded-lg rounded-tl-none p-3"
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto max-w-3/4 bg-gray-200 rounded-lg rounded-tl-none p-3">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 flex"
      >
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type your response..."
          disabled={isLoading || chatCompleted}
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#00ff9d]"
        />
        <button
          type="submit"
          disabled={isLoading || chatCompleted || !currentMessage.trim()}
          className="bg-[#00ff9d] text-black px-4 py-2 rounded-r-lg hover:bg-[#00ff9d] focus:outline-none focus:ring-2 focus:ring-[#00ff9d] disabled:bg-gray-400 flex items-center"
        >
          <FiSend className="mr-1" size={16} />
          Send
        </button>
      </form>

      {/* Chat completed message */}
      {chatCompleted && (
        <div className="p-4 bg-green-100 text-green-700 text-center border-t border-green-200 flex items-center justify-center">
          <FiCheckCircle className="mr-2" size={18} />
          Chat completed! Your responses have been recorded.
        </div>
      )}
    </div>
  );
}

