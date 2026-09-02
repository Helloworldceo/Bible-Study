import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Send, Bot, Check, AlertCircle, Copy,
  Clock, Terminal, Loader2
} from 'lucide-react';
import { DiscordConfig, DiscordDeliveryLogEntry, Language } from '../types';
import { useTranslation } from '../utils/translations';

interface DiscordBotHubProps {
  lang: Language;
  onSendWebhookTest: (config: DiscordConfig) => Promise<{ success: boolean; message: string; verse?: any }>;
}

const EMPTY_CONFIG: DiscordConfig = {
  webhookUrl: '',
  channelName: 'daily-scripture',
  serverName: '',
  isEnabled: false,
  language: 'both',
  includeDevotionalSnippet: true,
};

export const DiscordBotHub: React.FC<DiscordBotHubProps> = ({
  lang,
  onSendWebhookTest,
}) => {
  const t = useTranslation(lang);

  const [config, setConfig] = useState<DiscordConfig>(EMPTY_CONFIG);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [copiedBotCode, setCopiedBotCode] = useState(false);
  const [botCode, setBotCode] = useState<string>('');
  const [deliveryLogs, setDeliveryLogs] = useState<DiscordDeliveryLogEntry[]>([]);

  // Config and delivery history now live server-side (a single global
  // config, not per-browser) -- this is what makes the daily cron post
  // actually possible: it has no access to a browser's local storage.
  // Admin-only server-side (see requireAdmin in server.ts), so every
  // request here needs the signed-in admin's token.
  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem('berean_auth_token_v1');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadConfig = () => {
    fetch('/api/discord/config', { headers: authHeaders() })
      .then(res => res.json())
      .then(data => { if (data.config) setConfig(data.config); })
      .catch(console.error)
      .finally(() => setIsLoadingConfig(false));
  };

  const loadLogs = () => {
    fetch('/api/discord/logs', { headers: authHeaders() })
      .then(res => res.json())
      .then(data => { if (data.logs) setDeliveryLogs(data.logs); })
      .catch(console.error);
  };

  useEffect(() => {
    loadConfig();
    loadLogs();
    fetch('/api/discord/bot-code')
      .then(res => res.json())
      .then(data => { if (data.code) setBotCode(data.code); })
      .catch(console.error);
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/discord/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save.');
      setConfig(data.config);
      setStatusMessage({ text: 'Configuration saved.', isError: false });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to save configuration.', isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestDispatch = async () => {
    if (!config.webhookUrl) {
      setStatusMessage({ text: 'Please enter your Discord Webhook URL below.', isError: true });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);
    try {
      const res = await onSendWebhookTest(config);
      if (res.success) {
        setStatusMessage({ text: res.message || 'Scripture verse successfully dispatched to Discord!', isError: false });
        loadLogs();
      } else {
        setStatusMessage({ text: res.message || 'Failed to dispatch to Discord.', isError: true });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Network error sending to Discord.', isError: true });
      loadLogs();
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyBotCode = () => {
    if (botCode) {
      navigator.clipboard.writeText(botCode);
      setCopiedBotCode(true);
      setTimeout(() => setCopiedBotCode(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#5865F2]/90 to-[#4752C4] text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Bot className="w-5 h-5 text-indigo-200" />
            <span className="text-xs uppercase tracking-widest font-semibold text-indigo-200">
              {lang === 'am' ? 'የዲስኮርድ የዕለት ጥቅስ ቦት' : 'Automated Discord Channel Integration'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-bible">
            {t.discordBotHub}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 max-w-xl">
            {lang === 'am'
              ? 'በየቀኑ ጠዋት አንድ የተመረጠ ጥቅስ እና ጸሎት ወደ ዲስኮርድ ቻናልህ በቀጥታ በእንግሊዝኛ እና በአማርኛ ይላካል።'
              : 'Broadcast a different bilingual verse and prayer to your Discord server every day, automatically -- no bot hosting required.'}
          </p>
        </div>

        <button
          onClick={handleTestDispatch}
          disabled={isSending}
          className="px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
        >
          <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
          <span>{isSending ? 'Sending to Discord...' : 'Send a Verse Now'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-medium ${
          statusMessage.isError
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.isError ? <AlertCircle className="w-4 h-4 text-rose-500" /> : <Check className="w-4 h-4 text-emerald-500" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}

      {isLoadingConfig ? (
        <div className="flex items-center justify-center py-16 text-stone-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading configuration...</span>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Configuration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <h2 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <span>Discord Webhook Configuration</span>
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-discord-sync"
                  checked={config.isEnabled}
                  onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
                />
                <label htmlFor="enable-discord-sync" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                  Post automatically every day
                </label>
              </div>
            </div>

            {config.isEnabled && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-[11px] text-indigo-800 dark:text-indigo-200">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  A different verse posts automatically every day at <strong>08:00 UTC</strong> once you save this with a webhook URL below.
                  Remember to save your changes -- the checkbox alone doesn't take effect until you do.
                </span>
              </div>
            )}

            {/* Webhook URL input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span>Discord Webhook URL</span>
                <span className="text-[11px] text-stone-400">Server Settings → Integrations → Webhooks</span>
              </label>
              <input
                type="url"
                value={config.webhookUrl}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder="https://discord.com/api/webhooks/123456789/abcdef..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-[11px] text-stone-500">
                Create a webhook in your Discord channel in seconds. No bot hosting required!
              </p>
            </div>

            {/* Channel and Server Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Target Channel (for display only)
                </label>
                <input
                  type="text"
                  value={config.channelName}
                  onChange={(e) => setConfig({ ...config, channelName: e.target.value })}
                  placeholder="#daily-scripture"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Server Name (for display only)
                </label>
                <input
                  type="text"
                  value={config.serverName}
                  onChange={(e) => setConfig({ ...config, serverName: e.target.value })}
                  placeholder="My Faith Community"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Language */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Scripture Language
              </label>
              <select
                value={config.language}
                onChange={(e: any) => setConfig({ ...config, language: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs outline-none"
              >
                <option value="both">Both (English & አማርኛ Bilingual)</option>
                <option value="en">English Only</option>
                <option value="am">Amharic Only (አማርኛ)</option>
              </select>
            </div>

            {/* Include prayer checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="include-devotional"
                checked={config.includeDevotionalSnippet}
                onChange={(e) => setConfig({ ...config, includeDevotionalSnippet: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
              />
              <label htmlFor="include-devotional" className="text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                Include Daily Guided Prayer Focus in Discord Embed
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={handleTestDispatch}
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending...' : 'Test Webhook Now'}</span>
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>

          </div>

          {/* Quick 3-Step Setup Guide */}
          <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-3">
            <h3 className="font-bold text-stone-800 dark:text-stone-200 text-xs uppercase tracking-wider">
              📖 How to Get Your Discord Webhook in 3 Steps:
            </h3>
            <ol className="text-xs text-stone-600 dark:text-stone-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li>In Discord, right-click your desired channel (e.g. <code>#daily-verse</code>) and choose <strong>Edit Channel</strong>.</li>
              <li>Go to <strong>Integrations</strong> → <strong>Webhooks</strong> → Click <strong>New Webhook</strong>.</li>
              <li>Click <strong>Copy Webhook URL</strong>, paste it above, check "Post automatically every day," and save!</li>
            </ol>
          </div>

        </div>

        {/* Right Column: Live Discord Simulator & Bot Code (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Discord Embed Simulator */}
          <div className="bg-[#313338] text-white rounded-3xl p-5 border border-stone-700 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 pb-2 border-b border-[#3F4147]">
              <div className={`w-3 h-3 rounded-full ${config.isEnabled && config.webhookUrl ? 'bg-emerald-500' : 'bg-stone-500'}`} />
              <span>Discord Channel Preview (# {config.channelName || 'daily-scripture'})</span>
            </div>

            {/* Message Row */}
            <div className="flex items-start gap-3 text-xs">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center font-bold text-white shrink-0 shadow">
                B
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-amber-400">Berean Study Bible Bot</span>
                  <span className="px-1 py-0.5 rounded bg-[#5865F2] text-[10px] uppercase font-bold text-white">BOT</span>
                  <span className="text-[10px] text-stone-400">Today at 08:00 UTC</span>
                </div>

                {/* The Rich Embed */}
                <div className="bg-[#2B2D31] rounded-lg p-3.5 border-l-4 border-[#D97706] space-y-2.5">
                  <div className="text-xs font-bold text-amber-300">
                    ✨ Daily Scripture & Devotional Reminder | የዕለት ጥቅስ
                  </div>

                  <div className="space-y-1.5 text-stone-200">
                    <div className="font-bold text-stone-100">
                      📖 Psalm 23:1 | መዝሙረ ዳዊት 23፥1
                    </div>
                    {config.language !== 'am' && (
                      <div className="italic text-[11px] text-stone-300">
                        "The Lord is my shepherd; I shall not want."
                      </div>
                    )}
                    {config.language !== 'en' && (
                      <div className="font-ethiopic text-[11px] text-stone-200 mt-1">
                        "እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም።"
                      </div>
                    )}
                    <div className="text-[10px] text-amber-400 pt-1">
                      🌿 Theme: Comfort
                    </div>
                  </div>

                  {config.includeDevotionalSnippet && (
                    <div className="pt-2 border-t border-stone-700/60 text-[11px] text-stone-300">
                      <strong className="text-emerald-400 block text-[10px]">🙏 Daily Prayer Focus | የዛሬ ጸሎት</strong>
                      Lord, guide my steps today by Your living Word and fill my heart with Your peace.
                    </div>
                  )}

                  <div className="text-[10px] text-stone-400 pt-1">
                    Berean Bilingual Study Bible • English & አማርኛ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery History Log */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">
              Recent Dispatches
            </h4>
            {deliveryLogs.length === 0 ? (
              <p className="text-xs text-stone-400">No dispatches yet -- try "Send a Verse Now" above, or enable automatic daily posting.</p>
            ) : (
              <div className="space-y-2">
                {deliveryLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-800 dark:text-stone-200 truncate">{log.verseRef}</div>
                      <div className="text-[10px] text-stone-400">
                        {new Date(log.sentAt).toLocaleString()} • {log.triggerSource === 'cron' ? 'Automatic' : 'Manual'}
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${
                      log.status === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}>
                      {log.status === 'success' ? 'Delivered' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Standalone Discord Bot Code Exporter -- an advanced alternative,
              not needed for the automatic daily post above */}
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-5 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-300">
                  Advanced: Self-Hosted Bot (discord.js)
                </h4>
              </div>
              <button
                onClick={handleCopyBotCode}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedBotCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBotCode ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-400">
              Optional -- the webhook above already posts automatically every day. Run this yourself only if you want live slash commands like <code>/verse</code> and <code>/amharic</code> in your server.
            </p>

            <pre className="p-3 bg-stone-950 rounded-xl text-[11px] font-mono text-stone-300 max-h-40 overflow-y-auto no-scrollbar">
              {botCode || '// Loading discord.js bot starter template...'}
            </pre>
          </div>

        </div>

      </div>
      )}

    </div>
  );
};
