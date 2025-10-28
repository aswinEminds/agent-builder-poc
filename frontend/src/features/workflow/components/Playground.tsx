/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { Modal, ModalHeader, ModalBody } from "@/shared/components/ui";
import { Send, Loader2, RotateCcw, User, Bot } from "lucide-react";
import { axiosInstance } from "@config/http/http";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PlaygroundModalProps {
  show: boolean;
  onHide: () => void;
  workflowId: string;
  title: string;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const PlaygroundModal: React.FC<PlaygroundModalProps> = ({
  show,
  onHide,
  workflowId,
  title,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Sending workflow execution request...");

      const response = await axiosInstance.post(
        `/workflows/${workflowId}/execute`,
        { input: userMessage.content },
        {
          timeout: 60000, // 60 second timeout
        }
      );

      console.log("Received response:", response.data);

      // Handle different response structures more robustly
      let content: string;
      const responseData = response.data;

      if (responseData?.data) {
        content =
          typeof responseData.data === "string"
            ? responseData.data
            : JSON.stringify(responseData.data, null, 2);
      } else if (responseData?.response) {
        content =
          typeof responseData.response === "string"
            ? responseData.response
            : JSON.stringify(responseData.response, null, 2);
      } else if (typeof responseData === "string") {
        content = responseData;
      } else {
        content = JSON.stringify(responseData, null, 2);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      console.log("Message added successfully");
    } catch (error: any) {
      console.error("Workflow execution error:", error);

      let errorMessage = "Failed to execute workflow";

      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timed out. The workflow is taking too long to respond.";
      } else if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      toast.error(errorMessage);

      const errorMessageObj: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
  };

  const handleClose = () => {
    handleClear();
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="!w-[90vw] !h-[90vh] !max-w-[90vw] !max-h-[90vh]"
      closeOnBackdrop={false}
    >
      <ModalHeader
        onClose={handleClose}
        className="border-b border-slate-200 bg-white"
      >
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-base font-bold text-slate-900">
            Playground / {title}
          </span>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </ModalHeader>

      <ModalBody className="p-0 flex flex-col h-[calc(90vh-120px)] bg-white">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-white">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 bg-white">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-200">
                <Bot className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-600">
                Start testing your workflow
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Send a message to see how it responds
              </p>
            </div>
          )}

          <div className="p-4 space-y-6 bg-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar - Show on left for assistant, right for user */}
                {message.type === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-300">
                      <Bot className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`flex-1 min-w-0 max-w-[75%] ${message.type === "user" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`flex items-center gap-2 mb-1 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <span className="text-sm font-medium text-slate-900">
                      {message.type === "user" ? "You" : "Assistant"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    className={`inline-block text-sm leading-relaxed p-3 rounded-lg max-w-full ${
                      message.type === "user"
                        ? "bg-slate-900 text-white rounded-br-none"
                        : message.content.startsWith("Error:")
                          ? "bg-red-50 text-red-700 rounded-bl-none border border-red-300"
                          : "bg-white text-slate-700 rounded-bl-none border border-slate-300"
                    }`}
                  >
                    {message.type === "user" ? (
                      <pre className="whitespace-pre-wrap font-sans break-words">
                        {message.content}
                      </pre>
                    ) : (
                      <div className="markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Customize heading styles
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold mb-3 mt-2 text-slate-900">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-bold mb-2 mt-2 text-slate-900">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-bold mb-2 mt-2 text-slate-900">
                                {children}
                              </h3>
                            ),
                            // Customize paragraph styles
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 text-slate-700">
                                {children}
                              </p>
                            ),
                            // Customize list styles
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1 text-slate-700">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-700">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="ml-2">{children}</li>
                            ),
                            // Customize table styles
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-3">
                                <table className="min-w-full border-collapse border border-slate-300 text-sm bg-white">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-slate-50 border-b border-slate-300">
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => (
                              <tbody className="bg-white">{children}</tbody>
                            ),
                            tr: ({ children }) => (
                              <tr className="border-b border-slate-200">
                                {children}
                              </tr>
                            ),
                            th: ({ children }) => (
                              <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-900 bg-slate-50">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border border-slate-300 px-3 py-2 text-slate-700 bg-white">
                                {children}
                              </td>
                            ),
                            // Customize code styles
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-slate-800 border border-slate-200">
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-slate-900 text-white p-2 rounded text-xs font-mono overflow-x-auto border border-slate-700">
                                  {children}
                                </code>
                              );
                            },
                            // Customize strong (bold) styles
                            strong: ({ children }) => (
                              <strong className="font-bold text-slate-900">
                                {children}
                              </strong>
                            ),
                            // Customize emphasis (italic) styles
                            em: ({ children }) => (
                              <em className="italic text-slate-700">
                                {children}
                              </em>
                            ),
                            // Customize horizontal rule
                            hr: () => <hr className="my-3 border-slate-300" />,
                            // Customize blockquote
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-slate-300 pl-3 my-2 italic text-slate-600 bg-slate-50 py-2 rounded-r">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>

                {/* Avatar - Show on right for user */}
                {message.type === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-300">
                    <Bot className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                <div className="flex-1 max-w-[75%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-900">
                      Assistant
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 bg-white p-3 rounded-lg rounded-bl-none border border-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Container */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white p-4">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="flex-1 resize-none border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 min-h-[44px] max-h-[120px] bg-white text-slate-900"
              rows={1}
              disabled={isLoading}
              style={{
                height: "auto",
                minHeight: "44px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors border border-slate-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default PlaygroundModal;
