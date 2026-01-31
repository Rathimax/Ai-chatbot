import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import MessageBubble from './Message';

// --- (Unchanged helper components) ---
interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onPromptClick: (promptText: string) => void;
}
const TypingIndicator: React.FC = () => (<div className="typing-indicator"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>);
const RetryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0M6.828 6.828A8.25 8.25 0 0118.49 18.49m-4.992-4.992v4.992m0 0h-4.992m4.992 0l-3.182-3.182a8.25 8.25 0 00-11.664 0" /></svg>);
// --- (End of unchanged components) ---

// --- Typewriter Component ---
const Typewriter: React.FC<{ text: string; speed?: number; delay?: number; className?: string }> = ({ text, speed = 40, delay = 0, className }) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  React.useEffect(() => {
    if (!started) return;
    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, started, text, speed]);

  return (
    <span className={`${className} ${started && displayedText.length < text.length ? 'typing-cursor' : ''}`}>
      {displayedText}
    </span>
  );
};
// ----------------------------

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, error, onRetry, onPromptClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const examplePrompts = ["Get perspectives on tricky problems", "Brainstorm creative ideas", "Rewrite message for maximum impact", "Summarize key points"];

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return "Good morning";
    if (currentHour >= 12 && currentHour < 18) return "Good afternoon";
    return "Good evening";
  };

  const subtitles = [
    "How can I help you today?",
    "Good to see you!",
    "Ready when you are.",
    "What's on your mind?",
    "Let's solve something together."
  ];

  const subtitle = React.useMemo(() => {
    return subtitles[Math.floor(Math.random() * subtitles.length)];
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /* --- PROMPT REFRESH LOGIC --- */
  const allPrompts = [
    "Get perspectives on tricky problems", "Brainstorm creative ideas", "Rewrite message for maximum impact", "Summarize key points",
    "How does a car engine work?", "Explain quantum physics to a 5-year-old", "Write a poem about rain", "Debug this React error"
  ];

  const [visiblePrompts, setVisiblePrompts] = React.useState(allPrompts.slice(0, 4));

  const handleRefreshPrompts = () => {
    // Simple shuffle for demo
    const shuffled = [...allPrompts].sort(() => 0.5 - Math.random());
    setVisiblePrompts(shuffled.slice(0, 4));
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto chat-window">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {messages.length === 0
          ? (
            // If there are no messages, show the welcome screen
            <div className="welcome-container">
              <h2 className="welcome-heading">
                <Typewriter text={getGreeting()} speed={50} />
              </h2>
              <h3 className="welcome-subheading">
                <Typewriter text={subtitle} speed={30} delay={1000} />
              </h3>
              <p className="prompt-info">Below are the example of prompt, you can write your own to start chatting with ThinkAI</p>
              <div className="prompt-grid">
                {visiblePrompts.map((prompt) => (
                  <button key={prompt} className="prompt-button" onClick={() => onPromptClick(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>

              <button
                className="refresh-prompts-btn"
                onClick={handleRefreshPrompts}
              >
                <img
                  src="/refresh.png"
                  alt="Refresh"
                  className="w-5 h-5 object-contain"
                />
                Refresh prompts
              </button>

            </div>
          ) : (
            // Otherwise, show the list of messages
            <div>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onRetry={onRetry} isLoading={isLoading} />
              ))}
            </div>
          )
        }

        {/* --- (Error and Loading indicators remain unchanged) --- */}
        {error && (<div className="flex justify-center mb-4"><div className="bg-danger/20 border border-danger/50 rounded-xl p-4 max-w-md shadow-lg"><div className="flex items-start gap-3"><svg className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><div className="flex-1"><p className="text-danger text-sm font-medium mb-2">{error}</p><button onClick={onRetry} className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1"><RetryIcon className="w-4 h-4" />Retry</button></div></div></div></div>)}

        {/* We NO LONGER need the separate loading bubble logic here */}
      </div>
    </div>
  );
};

export default ChatWindow;