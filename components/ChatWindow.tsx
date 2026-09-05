'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ChatWindowProps {
  initialMessages?: ChatMessage[];
  onSendMessage?: (messageText: string) => Promise<void> | void;
  isLoading?: boolean;
}

const QUICK_SUGGESTIONS = [
  'Analyze my monthly burn rate',
  'How can I cut software subscription costs?',
  'Show top spend categories for this quarter',
  'What is our projected cash runway?',
];

export default function ChatWindow({
  initialMessages = [],
  onSendMessage,
  isLoading = false,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [prevInitialMessages, setPrevInitialMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state synchronously during render when initialMessages prop changes
  if (initialMessages !== prevInitialMessages) {
    setPrevInitialMessages(initialMessages);
    setMessages(initialMessages);
  }

  useEffect(() => {
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSubmitting) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsSubmitting(true);

    try {
      if (onSendMessage) {
        await onSendMessage(text);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 d-flex flex-column" style={{ height: '600px' }}>
      {/* Header */}
      <div className="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between rounded-top-4">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center">
            <i className="bi bi-robot fs-5"></i>
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">Financial AI Advisor</h6>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              <span className="d-inline-block bg-success rounded-circle me-1" style={{ width: '6px', height: '6px' }}></span>
              Active & ready to analyze
            </span>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-light btn-sm text-muted rounded-circle"
          onClick={() => setMessages([])}
          title="Clear Conversation"
          aria-label="Clear conversation history"
        >
          <i className="bi bi-trash3"></i>
        </button>
      </div>

      {/* Messages Body */}
      <div className="card-body overflow-auto p-3 d-flex flex-column gap-3 bg-light-subtle">
        {messages.length === 0 ? (
          <div className="text-center my-auto py-4">
            <div className="p-3 bg-primary-subtle text-primary rounded-circle d-inline-flex mb-3">
              <i className="bi bi-chat-left-dots fs-3"></i>
            </div>
            <h6 className="fw-bold text-dark mb-1">How can I help with your finances today?</h6>
            <p className="text-muted small max-w-sm mx-auto">
              Ask about cost reduction, category breakdowns, or financial forecasting.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex flex-column ${
                msg.sender === 'user' ? 'align-items-end' : 'align-items-start'
              }`}
            >
              <div
                className={`p-3 rounded-4 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white border text-dark'
                }`}
                style={{ maxWidth: '80%', wordBreak: 'break-word' }}
              >
                <p className="mb-0 small" style={{ lineHeight: '1.5' }}>
                  {msg.text}
                </p>
              </div>
              <span className="text-muted px-1 mt-1" style={{ fontSize: '10px' }}>
                {msg.timestamp}
              </span>
            </div>
          ))
        )}

        {(isLoading || isSubmitting) && (
          <div className="d-flex align-items-start gap-2">
            <div className="p-2 bg-white border rounded-4 shadow-sm text-muted d-flex align-items-center gap-2">
              <span className="spinner-grow spinner-grow-sm text-primary" role="status" aria-hidden="true"></span>
              <span className="small text-secondary">Analyzing financial data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 0 && (
        <div className="px-3 py-2 bg-light border-top d-flex gap-2 overflow-x-auto">
          {QUICK_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-outline-secondary btn-sm text-nowrap rounded-pill py-1 px-3"
              style={{ fontSize: '12px' }}
              onClick={() => handleSend(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Footer */}
      <div className="card-footer bg-white border-top p-3 rounded-bottom-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="d-flex align-items-center gap-2"
        >
          <input
            type="text"
            className="form-control form-control-md rounded-pill border-light-subtle bg-light px-3"
            placeholder="Ask anything about your expenses..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isSubmitting}
          />
          <button
            type="submit"
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '40px', height: '40px' }}
            disabled={!inputText.trim() || isLoading || isSubmitting}
            aria-label="Send message"
          >
            <i className="bi bi-send-fill text-white"></i>
          </button>
        </form>
      </div>
    </div>
  );
}