import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AIHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIHelpModal({ isOpen, onClose }: AIHelpModalProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "How can I help you today? I'm here to provide parenting support and advice.",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const aiHelpMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch("/api/ai/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  });

  const handleSend = () => {
    if (!question.trim() || aiHelpMutation.isPending) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    aiHelpMutation.mutate(question);
    setQuestion("");
  };

  const suggestedPrompts = [
    "My baby won't sleep, what can I do?",
    "Any potty training tips?",
    "How do I handle toddler tantrums?",
    "What are some healthy meal ideas for toddlers?"
  ];

  const handleSuggestedPrompt = (prompt: string) => {
    setQuestion(prompt);
    // Automatically send the suggested prompt
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    aiHelpMutation.mutate(prompt);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center space-x-2 text-pink-800">
            <Bot className="w-6 h-6" />
            <span>AI Parenting Assistant</span>
          </DialogTitle>
          <DialogDescription>
            Get helpful parenting advice and support from our AI assistant.
          </DialogDescription>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-pink-50/30 rounded-lg mx-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.isUser ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.isUser 
                  ? 'bg-pink-200 text-pink-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {message.isUser ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[70%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-pink-100 text-pink-800 ml-auto'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {aiHelpMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
                <Bot size={16} />
              </div>
              <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <div className="space-y-2 p-4">
            <p className="text-sm text-gray-600 font-medium">Suggested questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-left h-auto p-2 text-xs hover:bg-pink-50"
                  onClick={() => handleSuggestedPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - Always at bottom */}
        <div className="p-6 border-t bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={aiHelpMutation.isPending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              style={{ fontSize: '14px' }}
            />
            <Button 
              onClick={handleSend}
              disabled={!question.trim() || aiHelpMutation.isPending}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}