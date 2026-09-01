import React, { useState } from 'react';
import { 
  Bot, Sparkles, Send, Copy, Check, BookOpen, 
  HelpCircle, MessageSquare, Flame, BookHeart
} from 'lucide-react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';

interface AIStudyCompanionProps {
  lang: Language;
  onSaveToJournal: (title: string, content: string) => void;
  onOpenPassageInBible: (bookId: string, chapter: number) => void;
}

export const AIStudyCompanion: React.FC<AIStudyCompanionProps> = ({
  lang,
  onSaveToJournal,
  onOpenPassageInBible,
}) => {
  const t = useTranslation(lang);

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: lang === 'am' 
        ? 'ሰላም! እኔ የቤሪያ የመጽሐፍ ቅዱስ ጥናት ረዳትዎ ነኝ። ስለ ማንኛውም የመጽሐፍ ቅዱስ ክፍል፣ የቃላት ትርጓሜ (ዕብራይስጥ፣ ግሪክ፣ ግዕዝ) ወይም የመንፈሳዊ ሕይወት ጥያቄዎች ሊጠይቁኝ ይችላሉ።'
        : 'Grace and peace! I am your Berean Theological Study Companion. Ask me anything about Scripture passages, original Hebrew/Greek roots, Ge\'ez theological heritage, or practical discipleship application.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const promptSuggestions = [
    {
      labelEn: 'Explain "Logos" (ቃል) in John 1:1 in Ge\'ez & Greek',
      labelAm: 'በዮሐንስ 1:1 ላይ "ቃል" (Logos) በግዕዝና በግሪክ ትርጉም',
      q: 'Explain the theological depth of "The Word" (Logos / ቃል) in John 1:1, analyzing its Greek and Ethiopian Ge\'ez roots.'
    },
    {
      labelEn: 'How does Romans 8 speak to anxiety and suffering?',
      labelAm: 'የሮሜ ምዕራፍ 8 ስለ ጭንቀት እና መከራ ምን ያስተምራል?',
      q: 'How does Romans 8 address anxiety, suffering, and the believer’s eternal security in Christ?'
    },
    {
      labelEn: 'The historical Shepherd context of Psalm 23',
      labelAm: 'የመዝሙረ ዳዊት 23 ታሪካዊ የእረኝነት አውድ',
      q: 'Explain the historical and cultural context of shepherds in ancient Israel as reflected in Psalm 23.'
    },
    {
      labelEn: 'Grace vs Law in the Epistle to the Galatians',
      labelAm: 'በገላትያ መልእክት ውስጥ ጸጋ እና ሕግ',
      q: 'Explain the biblical contrast between the Law and the Gospel of Grace in the Epistle to the Galatians.'
    }
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || question;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/study-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend, lang })
      });
      const data = await res.json();

      const assistantMsg = {
        role: 'assistant' as const,
        text: data.answer || 'Thank you for your question. Continue meditating on Scripture.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Scripture is God-breathed and profitable for teaching and training in righteousness. (2 Timothy 3:16)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 to-stone-900 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/30 backdrop-blur-md flex items-center justify-center border border-amber-300/40">
            <Bot className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-200">
                {lang === 'am' ? 'የቲዎሎጂ ጥናት ረዳት' : 'Gemini 3.7 Theological Guide'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-bible">
              {t.theologicalQA}
            </h1>
            <p className="text-xs text-amber-100/80 mt-0.5">
              Bilingual biblical commentary, original language insights, and scriptural clarity.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Starters */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
          Suggested Study Topics:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.q)}
              className="p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-400 dark:hover:border-amber-600 text-left text-xs font-medium text-stone-800 dark:text-stone-200 shadow-sm transition-all flex items-center justify-between gap-2 group"
            >
              <span>{lang === 'am' ? item.labelAm : item.labelEn}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 min-h-[360px] max-h-[550px] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow">
                B
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-amber-600 text-white font-medium shadow-sm'
                  : 'bg-stone-50 dark:bg-stone-800/70 text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700/60'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-700/60 text-[11px] text-stone-400">
                  <span>{msg.time}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => onSaveToJournal('AI Study Takeaway', msg.text)}
                      className="hover:text-amber-600 flex items-center gap-1"
                    >
                      <BookHeart className="w-3 h-3" />
                      <span>Save to Journal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
              B
            </div>
            <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-500 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <span>Examining Scripture in context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={lang === 'am' ? 'የመጽሐፍ ቅዱስ ጥያቄዎን እዚህ ይጠይቁ...' : 'Ask any biblical, theological, or language question...'}
          className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>

    </div>
  );
};
