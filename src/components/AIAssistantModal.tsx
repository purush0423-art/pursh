import React, { useState } from 'react';
import { runAITriage } from '../services/api';
import { X, Sparkles, Send, Bot, HelpCircle, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface AIAssistantModalProps {
  onClose: () => void;
  onAutoFillComplaint?: (data: any) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onClose, onAutoFillComplaint }) => {
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; data?: any }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your Smart Campus AI Helper. You can describe any campus facility issue or ask questions about repair SLAs, Wi-Fi troubleshooting, or emergency protocols.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const userText = promptInput.trim();
    setPromptInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const triage = await runAITriage(userText);
      const aiReply = `I've analyzed your input:
• **Category**: ${triage.suggestedCategory}
• **Priority**: ${triage.suggestedPriority.toUpperCase()}
• **Recommended SLA**: ~${triage.estimatedResolutionHours} Hours
• **Action**: ${triage.recommendedAction}`;

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          data: triage
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'I can assist you with campus facility FAQs. To file an official ticket, click the "Submit Complaint" button on your navbar.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-assistant-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div id="ai-assistant-modal-card" className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-purple-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Smart Campus AI Triage Assistant</h3>
              <p className="text-[11px] text-purple-200/80">Gemini-powered facility intelligence</p>
            </div>
          </div>

          <button
            id="close-ai-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-purple-200 hover:text-white hover:bg-purple-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-slate-500 text-xs">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>AI is analyzing facility incident details...</span>
            </div>
          )}
        </div>

        {/* Quick FAQ Prompts */}
        <div className="p-3 bg-white border-t border-slate-200 flex gap-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => setPromptInput('What is the turnaround time for emergency plumbing tickets?')}
            className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 shrink-0 font-medium"
          >
            🚰 Plumbing SLA?
          </button>
          <button
            onClick={() => setPromptInput('Wi-Fi in Library Reading Hall is not connecting.')}
            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 shrink-0 font-medium"
          >
            📶 Library Wi-Fi issue
          </button>
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <input
            id="ai-assistant-input"
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Type your campus facility question or issue..."
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <button
            type="submit"
            id="ai-send-btn"
            disabled={loading || !promptInput.trim()}
            className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs hover:bg-purple-700 shadow-xs flex items-center gap-1 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>

      </div>
    </div>
  );
};
