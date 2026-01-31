import React, { useState, useEffect } from 'react';
import { streamChatResponse } from '../services/chatService';
import type { Message, ChatSettings, ChatSession, Attachment } from '../types';
import { Sender, ChatProvider, Model } from '../types';

const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSession = React.useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const messages = activeSession?.messages || [];
  const settings = activeSession?.settings || { provider: ChatProvider.Gemini, model: Model.GeminiFlash, temperature: 0.7, systemPrompt: 'You are a helpful and friendly AI assistant.' };

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('chatSessions');
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
          setSessions(parsedSessions);
          const storedActiveId = localStorage.getItem('activeChatSessionId');
          const activeIdIsValid = parsedSessions.some((s: ChatSession) => s.id === storedActiveId);
          setActiveSessionId(storedActiveId && activeIdIsValid ? storedActiveId : parsedSessions[0].id);
        } else {
          startNewChat();
        }
      } else {
        startNewChat();
      }
    } catch (e) { console.error("Failed to load sessions:", e); startNewChat(); }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        if (activeSessionId) localStorage.setItem('activeChatSessionId', activeSessionId);
      } catch (e) { console.error("Failed to save sessions:", e); }
    }
  }, [sessions, activeSessionId]);
  /* --- NEW: AbortController Ref --- */
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const sendMessage = async (text: string, attachments?: Attachment[]) => {
    if (!activeSessionId) return;

    // Abort previous request if exists (optional safety)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const newUserMessage: Message = { id: Date.now().toString(), sender: Sender.User, text, timestamp: new Date().toLocaleTimeString(), attachments };
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = { id: botMessageId, sender: Sender.Bot, text: '', timestamp: new Date().toLocaleTimeString() };
    const currentSession = sessions.find(s => s.id === activeSessionId);
    const history = currentSession ? [...currentSession.messages, newUserMessage] : [newUserMessage];
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, newUserMessage, botMessagePlaceholder] } : s));
    setIsLoading(true);
    setError(null);
    await streamChatResponse(history, settings,
      (chunk) => {
        setSessions(prev => prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const updatedMessages = s.messages.map(m => m.id === botMessageId ? { ...m, text: m.text + chunk } : m);
          return { ...s, messages: updatedMessages };
        }));
      },
      async () => {
        setIsLoading(false);
        abortControllerRef.current = null;

        // Auto-title trigger
        const currentSession = sessions.find(s => s.id === activeSessionId);
        if (currentSession && currentSession.title === 'New Chat' && history.length >= 1) {
          try {
            const { generateTitle } = await import('../services/titleService');
            const newTitle = await generateTitle(history, settings);
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: newTitle } : s));
          } catch (e) {
            console.error("Auto-title failed", e);
          }
        }
      },
      (err) => {
        if (err.name === 'AbortError') {
          setError('User requested to stop');
          setIsLoading(false);
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: s.messages.map(m => m.id === botMessageId ? { ...m, text: 'User requested to stop', error: true } : m) } : s));
          abortControllerRef.current = null;
          return;
        }
        setError(err.message || 'An unknown error occurred.');
        setIsLoading(false);
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: s.messages.map(m => m.id === botMessageId ? { ...m, text: `Error: ${err.message}`, error: true } : m) } : s));
        abortControllerRef.current = null;
      },
      abortController.signal // <-- Pass signal here
    );
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    // Abort any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    const currentSession = sessions.find(s => s.id === activeSessionId);
    const newSession: ChatSession = { id: `session_${Date.now().toString()}`, title: 'New Chat', messages: [], settings: { provider: ChatProvider.Gemini, model: Model.GeminiFlash, temperature: 0.7, systemPrompt: 'You are a helpful and friendly AI assistant.' } };

    setSessions(prev => {
      const cleanedSessions = prev.filter(s => {
        if (s.id === currentSession?.id && s.messages.length === 0) {
          return false;
        }
        return true;
      });
      return [newSession, ...cleanedSessions];
    });

    setActiveSessionId(newSession.id);
  };

  const switchChat = (sessionId: string) => {
    const departingSession = sessions.find(s => s.id === activeSessionId);
    if (departingSession && departingSession.messages.length === 0) {
      setSessions(prev => prev.filter(s => s.id !== departingSession.id));
    }
    setActiveSessionId(sessionId);
  };

  const deleteChat = (sessionId: string) => {
    const remainingSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(remainingSessions);
    if (activeSessionId === sessionId) {
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
      } else {
        startNewChat();
      }
    }
  };

  // --- NEW: Delete All Sessions Function ---
  const deleteAllSessions = () => {
    if (window.confirm("Are you sure you want to delete ALL chat history? This cannot be undone.")) {
      setSessions([]);
      localStorage.removeItem('chatSessions');
      localStorage.removeItem('activeChatSessionId');
      startNewChat();
    }
  };

  const clearChat = () => { if (!activeSessionId) return; setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [] } : s)); };
  const updateSettings = (newSettings: Partial<ChatSettings>) => { if (!activeSessionId) return; setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, settings: { ...s.settings, ...newSettings } } : s)); };
  const retryLastMessage = () => {
    if (!activeSessionId || messages.length === 0) return;
    const lastUserMessage = [...messages].reverse().find(m => m.sender === Sender.User);
    if (lastUserMessage) {
      const historyWithoutError = messages.filter(m => !m.error && m.id !== (parseInt(lastUserMessage.id, 10) + 1).toString());
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: historyWithoutError } : s));
      setTimeout(() => sendMessage(lastUserMessage.text), 100);
    }
  };
  const summarizeChat = () => { alert("Summarize feature is not implemented yet."); };

  return {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    error,
    settings,
    sendMessage,
    stopGeneration, // --- Export the new function
    clearChat,
    summarizeChat,
    updateSettings,
    retryLastMessage,
    startNewChat,
    switchChat,
    deleteChat,
    deleteAllSessions // Exporting the new function
  };
};

export default useChat;