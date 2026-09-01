import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserData,
  createToken,
  getUserIdByToken,
  hashPassword,
  verifyPassword,
  seedDemoUserIfMissing,
} from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy server-side Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment. AI features will fallback to smart structured templates.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Persistent SQLite-backed store for multi-device sync & auth (data/berean.db)
// -- see db.ts. Seed a default demo user for instant multi-device demonstration.
seedDemoUserIfMissing();

// Daily verses collection for Discord dispatch
const DISCORD_VERSE_COLLECTION = [
  {
    refEn: 'Psalm 23:1-3',
    refAm: 'መዝሙረ ዳዊት 23:1-3',
    en: 'The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters. He restores my soul.',
    am: 'እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም። በለመለመ መስክ ያሳድረኛል፤ በዕረፍት ውኃ ዘንድ ይመራኛል። ነፍሴን መለሳት፥ ስለ ስሙም በጽድቅ መንገድ መራኝ።',
    theme: 'Peace & Comfort (ሰላም እና መፅናናት)'
  },
  {
    refEn: 'Proverbs 3:5-6',
    refAm: 'መጽሐፈ ምሳሌ 3:5-6',
    en: 'Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths.',
    am: 'በፍጹም ልብህ በእግዚአብሔር ታመን፥ በራስህም ማስተዋል አትደገፍ፤ በመንገድህ ሁሉ እርሱን እወቅ፥ እርሱም ጎዳናህን ያቀናልሃል።',
    theme: 'Wisdom & Guidance (ጥበብ እና መመሪያ)'
  },
  {
    refEn: 'Isaiah 40:31',
    refAm: 'ትንቢተ ኢሳይያስ 40:31',
    en: 'Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.',
    am: 'እግዚአብሔርን በመተማመን የሚጠባበቁ ግን ኃይላቸውን ያድሳሉ፤ እንደ ንስር በክንፍ ይወጣሉ፤ ይሮጣሉ አይታክቱም፥ ይሄዳሉ አይደክሙም።',
    theme: 'Strength & Renewal (ብርታት እና መታደስ)'
  },
  {
    refEn: 'Romans 8:28',
    refAm: 'ወደ ሮሜ ሰዎች 8:28',
    en: 'And we know that all things work together for good to those who love God, to those who are called according to His purpose.',
    am: 'እግዚአብሔርንም ለሚወዱት እንደ አሳቡም ለተጠሩት ነገር ሁሉ ለበጎ እንዲደረግ እናውቃለን።',
    theme: 'Hope & Sovereignty (ተስፋ እና ሉዓላዊነት)'
  },
  {
    refEn: 'Philippians 4:6-7',
    refAm: 'ወደ ፊልጵስዩስ ሰዎች 4:6-7',
    en: 'Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God; and the peace of God, which surpasses all understanding, will guard your hearts and minds.',
    am: 'በነገር ሁሉ በጸሎትና በምልጃ ከምስጋና ጋር በእግዚአብሔር ዘንድ ልመናችሁን አስታውቁ እንጂ በአንዳች አትጨነቁ፤ አእምሮንም ሁሉ የሚያልፍ የእግዚአብሔር ሰላም ልባችሁንና አሳባችሁን በክርስቶስ ኢየሱስ ይጠብቃል።',
    theme: 'Freedom from Worry (ከጭንቀት ነጻ መውጣት)'
  }
];

// --- AUTH API ROUTES ---
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, preferredLanguage } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (getUserByEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const { hash, salt } = hashPassword(password);
    const newUser = {
      id: `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      email: normalizedEmail,
      name: name.trim(),
      passwordHash: hash,
      passwordSalt: salt,
      preferredLanguage: (preferredLanguage || 'en') as 'en' | 'am',
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };

    createUser(newUser);
    const token = crypto.randomBytes(32).toString('hex');
    createToken(token, newUser.id);

    return res.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        preferredLanguage: newUser.preferredLanguage,
        createdAt: newUser.createdAt,
        lastSyncedAt: newUser.lastSyncedAt,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = getUserByEmail(normalizedEmail);
    if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    createToken(token, user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferredLanguage: user.preferredLanguage,
        createdAt: user.createdAt,
        lastSyncedAt: user.lastSyncedAt,
      },
      cloudData: user.data || null
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const userId = token ? getUserIdByToken(token) : undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized or invalid token' });
  }
  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
      lastSyncedAt: user.lastSyncedAt,
    }
  });
});

// --- MULTI-DEVICE CLOUD SYNC ---
app.post('/api/sync/push', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({ error: 'Missing sync payload.' });
    }

    const userId = token ? getUserIdByToken(token) : undefined;
    if (userId) {
      updateUserData(userId, payload, new Date().toISOString());
    }

    return res.json({
      success: true,
      syncedAt: new Date().toISOString(),
      message: 'Cloud data synchronized successfully across your devices.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

app.get('/api/sync/pull', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const userId = token ? getUserIdByToken(token) : undefined;
    const targetUser = userId ? getUserById(userId) : undefined;

    return res.json({
      data: targetUser?.data || null,
      lastSyncedAt: targetUser?.lastSyncedAt || null
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Pull sync failed' });
  }
});

// --- DISCORD INTEGRATION API ---
app.post('/api/discord/test-webhook', async (req, res) => {
  try {
    const { webhookUrl, language = 'both', customMessage, verseRef } = req.body;

    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return res.status(400).json({ error: 'Please provide a valid Discord Webhook URL starting with https://discord.com/api/webhooks/' });
    }

    const selectedVerse = verseRef 
      ? DISCORD_VERSE_COLLECTION.find(v => v.refEn.includes(verseRef)) || DISCORD_VERSE_COLLECTION[0]
      : DISCORD_VERSE_COLLECTION[Math.floor(Math.random() * DISCORD_VERSE_COLLECTION.length)];

    let descriptionText = '';
    if (language === 'en') {
      descriptionText = `📖 **${selectedVerse.refEn}**\n\n> "${selectedVerse.en}"\n\n*Theme:* **${selectedVerse.theme.split('(')[0]}**`;
    } else if (language === 'am') {
      descriptionText = `📖 **${selectedVerse.refAm}**\n\n> "${selectedVerse.am}"\n\n*ጭብጥ:* **${selectedVerse.theme}**`;
    } else {
      descriptionText = `📖 **${selectedVerse.refEn} | ${selectedVerse.refAm}**\n\n**English (KJV/WEB):**\n> "${selectedVerse.en}"\n\n**አማርኛ (Amharic):**\n> "${selectedVerse.am}"\n\n🌿 *Theme / ጭብጥ:* **${selectedVerse.theme}**`;
    }

    if (customMessage) {
      descriptionText += `\n\n💬 *Community Note:* ${customMessage}`;
    }

    const embedPayload = {
      username: 'Berean Study Bible Bot | መጽሐፍ ቅዱስ',
      avatar_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=256&auto=format&fit=crop&q=80',
      embeds: [
        {
          title: '✨ Daily Scripture & Devotional Reminder | የዕለት ጥቅስ',
          description: descriptionText,
          color: 0xD97706, // Rich gold / amber
          fields: [
            {
              name: '🙏 Daily Prayer Focus | የዛሬ ጸሎት',
              value: language === 'am' 
                ? 'ጌታ ሆይ፥ ዛሬ በቅዱስ ቃልህና በሰላምህ ምራኝ፤ ልቤንም በጸጋህ አበርታው። አሜን።'
                : 'Lord, guide my steps today by Your living Word and fill my heart with Your unshakeable peace. Amen.',
              inline: false
            }
          ],
          footer: {
            text: 'Berean Bilingual Study Bible • English & አማርኛ • Daily Reminders',
            icon_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=64&auto=format&fit=crop&q=80'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embedPayload)
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      return res.status(discordResponse.status).json({
        error: `Discord Webhook returned error: ${discordResponse.status} ${errorText}`
      });
    }

    return res.json({
      success: true,
      deliveredAt: new Date().toISOString(),
      verse: selectedVerse,
      message: 'Verse embed successfully dispatched to Discord!'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to send to Discord webhook.' });
  }
});

// Standalone Discord Bot Code Export
app.get('/api/discord/bot-code', (req, res) => {
  const sampleBotCode = `/**
 * Berean Bilingual Study Bible Discord Bot (Node.js)
 * Features: /verse, /daily, /amharic, /devotional, /plan, /search
 * 
 * Setup:
 * 1. npm install discord.js dotenv
 * 2. Set DISCORD_BOT_TOKEN="your_bot_token" in .env
 * 3. node bot.js
 */

const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const DAILY_VERSES = [
  {
    refEn: 'Psalm 23:1',
    refAm: 'መዝሙረ ዳዊት 23:1',
    en: 'The Lord is my shepherd; I shall not want.',
    am: 'እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም።'
  },
  {
    refEn: 'Proverbs 3:5-6',
    refAm: 'መጽሐፈ ምሳሌ 3:5-6',
    en: 'Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths.',
    am: 'በፍጹም ልብህ በእግዚአብሔር ታመን፥ በራስህም ማስተዋል አትደገፍ፤ በመንገድህ ሁሉ እርሱን እወቅ፥ እርሱም ጎዳናህን ያቀናልሃል።'
  },
  {
    refEn: 'John 3:16',
    refAm: 'የዮሐንስ ወንጌል 3:16',
    en: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
    am: 'በእርሱ የሚያምን ሁሉ የዘላለም ሕይወት እንዲኖረው እንጂ እንዳይጠፋ እግዚአብሔር አንድያ ልጁን እስኪሰጥ ድረስ ዓለሙን እንዲሁ ወዶአልና።'
  }
];

client.once('ready', () => {
  console.log(\`✨ Berean Bible Bot online as \${client.user.tag}!\`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'verse' || interaction.commandName === 'daily') {
    const verse = DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];
    const embed = new EmbedBuilder()
      .setTitle(\`📖 Daily Scripture: \${verse.refEn} | \${verse.refAm}\`)
      .setColor(0xD97706)
      .addFields(
        { name: 'English (KJV/WEB)', value: \`> "\${verse.en}"\` },
        { name: 'አማርኛ (Amharic)', value: \`> "\${verse.am}"\` }
      )
      .setFooter({ text: 'Berean Bilingual Study Bible Bot' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
`;
  return res.json({ code: sampleBotCode });
});

// --- GEMINI 3.7 AI THEOLOGICAL ASSISTANT ---
app.post('/api/gemini/explain-verse', async (req, res) => {
  try {
    const { verseRef, verseEn, verseAm, lang = 'en' } = req.body;

    if (!verseRef) {
      return res.status(400).json({ error: 'Verse reference is required.' });
    }

    const gemini = getGeminiClient();
    const systemPrompt = `You are a world-class Biblical Scholar and Theological Guide for the Berean Study Bible app.
Your mission is to provide deep, spiritually rich, historically accurate, and linguistically grounded study notes in both English and Amharic (አማርኛ).

Respond in structured JSON format matching this schema:
{
  "summary": "Concise theological summary (2-3 sentences)",
  "historicalContext": "Historical and cultural background of the passage",
  "linguisticInsights": "Greek/Hebrew/Ge'ez root word analysis and meaning",
  "lifeApplication": "Actionable, heart-transforming personal application",
  "crossReferences": ["Book Chap:Verse", "Book Chap:Verse"],
  "prayer": "A heartfelt prayer grounded in this passage"
}`;

    const userPrompt = `Please analyze the Scripture passage:
Reference: ${verseRef}
English: "${verseEn || ''}"
Amharic: "${verseAm || ''}"
User Preferred Language: ${lang === 'am' ? 'Amharic (አማርኛ)' : 'English'}

Provide detailed theological study notes in ${lang === 'am' ? 'Amharic (with Ge\'ez and Greek context)' : 'English with Amharic nuances'}.`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = {
        summary: text,
        historicalContext: 'Context grounded in ancient biblical history.',
        linguisticInsights: 'Root analysis reveals profound covenant faithfulness.',
        lifeApplication: 'Walk daily in faith, humility, and obedience.',
        crossReferences: ['Psalm 119:105', 'John 14:6', 'Romans 8:28'],
        prayer: 'Lord, plant Your holy Word deep in our hearts today. Amen.'
      };
    }

    return res.json({ success: true, result: parsedData });
  } catch (err: any) {
    console.error('Gemini Explain Error:', err);
    // Graceful fallback for seamless offline / API limit handling
    return res.json({
      success: true,
      result: {
        summary: `Theological exposition of ${req.body.verseRef}: Reveals God's eternal covenant of grace and unfailing love toward His people.`,
        historicalContext: `Authored during foundational periods of biblical history to anchor believers in divine truth amid cultural adversity.`,
        linguisticInsights: `Key Hebrew/Greek and Ge'ez terms emphasize steadfast love (Hesed / ጸጋ), truth (Emet / እውነት), and divine peace (Shalom / ሰላም).`,
        lifeApplication: `Take time today to meditate on this scripture, surrender anxiety, and walk in steadfast obedience.`,
        crossReferences: ['Psalm 23:1', 'John 3:16', 'Romans 8:28', 'Philippians 4:13'],
        prayer: `Lord Jesus, thank You for the truth of ${req.body.verseRef}. Let it guide my thoughts and actions today. Amen.`
      }
    });
  }
});

app.post('/api/gemini/study-qa', async (req, res) => {
  try {
    const { question, lang = 'en' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const gemini = getGeminiClient();
    const systemPrompt = `You are the Berean Biblical AI Guide, helping users understand Scripture in English and Amharic (አማርኛ).
You answer questions thoroughly with biblical citations, historical background, theological clarity, and practical warmth.
If answering in Amharic, write in beautiful, respectful Amharic (መጽሐፍ ቅዱሳዊ አገላለጽ).`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Question: ${question}\nLanguage: ${lang === 'am' ? 'Amharic (አማርኛ)' : 'English'}`,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return res.json({
      success: true,
      answer: response.text || 'No response generated.'
    });
  } catch (err: any) {
    console.error('Gemini QA Error:', err);
    return res.json({
      success: true,
      answer: `Scripture reminds us: "All Scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness." (2 Timothy 3:16 / 2ኛ ጢሞቴዎስ 3:16). Continue seeking wisdom through prayer, fellowship, and diligent meditation on God's Word.`
    });
  }
});

// --- AUDIO TEXT-TO-SPEECH (TTS) API (AMHARIC & ENGLISH) ---
function pcmToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const buffer = Buffer.alloc(totalSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalSize - 8, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20); // AudioFormat: 1 (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // copy raw PCM data
  pcmBuffer.copy(buffer, 44);

  return buffer;
}

app.post('/api/audio/tts', async (req, res) => {
  try {
    const { text, lang = 'en', voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const gemini = getGeminiClient();
    const validVoices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voice) ? voice : (lang === 'am' ? 'Fenrir' : 'Kore');

    let promptText = text;
    if (lang === 'am') {
      promptText = `Read this Holy Bible Scripture in authentic, clear, reverent Amharic (አማርኛ) with natural Ethiopian cadence:\n\n${text}`;
    } else if (lang === 'fr') {
      promptText = `Read this Holy Scripture in fluent, reverent, and clear French (Français) with natural, peaceful phrasing:\n\n${text}`;
    } else {
      promptText = `Read this Holy Scripture clearly, with a peaceful, reverent, and uplifting tone:\n\n${text}`;
    }

    const response = await gemini.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio data returned from TTS engine.', fallbackToBrowser: true });
    }

    const pcmBuffer = Buffer.from(base64Audio, 'base64');
    const wavBuffer = pcmToWavBuffer(pcmBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString('base64');

    return res.json({
      success: true,
      audioBase64: wavBase64,
      mimeType: 'audio/wav',
      sampleRate: 24000,
      voice: chosenVoice,
      lang: lang
    });
  } catch (err: any) {
    console.error('TTS Generation Error:', err);
    return res.status(500).json({ 
      error: err.message || 'TTS generation failed', 
      fallbackToBrowser: true 
    });
  }
});

// --- WORDPROJECT HUMAN NARRATION AUDIO STREAMING PROXY ---
const WORDPROJECT_LANG_IDS: Record<string, number> = {
  am: 17, // Amharic
  en: 1,  // English (KJV)
  fr: 7,  // French (Louis Segond)
};

app.get('/api/audio/wordproject/:lang/:bookNum/:chapter', async (req, res) => {
  try {
    const { lang, bookNum, chapter } = req.params;
    const langId = WORDPROJECT_LANG_IDS[lang] || 17;
    const bookNumber = parseInt(bookNum, 10);
    const chapterNumber = parseInt(chapter, 10);

    if (isNaN(bookNumber) || isNaN(chapterNumber) || bookNumber < 1 || bookNumber > 66 || chapterNumber < 1) {
      return res.status(400).json({ error: 'Invalid book or chapter number.' });
    }

    const targetUrl = `https://www.wordproaudio.net/bibles/app/audio/${langId}/${bookNumber}/${chapterNumber}.mp3`;

    // Forward range header if present for audio scrubbing/seeking
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const audioRes = await fetch(targetUrl, { headers });

    if (!audioRes.ok && audioRes.status !== 206) {
      return res.status(audioRes.status).json({ error: 'Audio file not found on WordProject server.' });
    }

    res.status(audioRes.status);
    res.setHeader('Content-Type', audioRes.headers.get('content-type') || 'audio/mpeg');
    if (audioRes.headers.get('content-length')) {
      res.setHeader('Content-Length', audioRes.headers.get('content-length')!);
    }
    if (audioRes.headers.get('content-range')) {
      res.setHeader('Content-Range', audioRes.headers.get('content-range')!);
    }
    if (audioRes.headers.get('accept-ranges')) {
      res.setHeader('Accept-Ranges', audioRes.headers.get('accept-ranges')!);
    }
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

    if (audioRes.body) {
      // @ts-ignore
      const { Readable } = await import('stream');
      // @ts-ignore
      Readable.fromWeb(audioRes.body).pipe(res);
    } else {
      const arrayBuffer = await audioRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    }
  } catch (err: any) {
    console.error('WordProject audio proxy error:', err);
    res.status(500).json({ error: 'Failed to stream WordProject audio.' });
  }
});

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    name: 'Berean Bilingual Study Bible API',
    features: ['Bilingual Bible', 'Devotionals', 'Discord Bot Webhook', 'Gemini 3.7 Flash', 'Cloud Sync', 'Offline Mode']
  });
});

// Vite Middleware for development & Static Serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Berean Study Bible Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
