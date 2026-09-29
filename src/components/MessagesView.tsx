import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Chat, ChatMessage, Equipment } from '../types';
import { 
  ArrowLeft, Phone, User, Check, AlertCircle, SendHorizontal, 
  Eye, X, BookOpen, MapPin, Info, Shield, MessageSquare, Star, Trash2,
  Paperclip, Smile, Mic, CheckCheck, Search, MoreVertical, Copy, FileText, Camera,
  Download, Map, BellOff, XCircle, Info as InfoIcon, Play, Languages, Sliders
} from 'lucide-react';
import { MOCK_OWNER_REPLIES, generateSmartMachineryResponse } from '../data';

interface MessagesViewProps {
  chats: Chat[];
  equipmentList: Equipment[];
  language: 'te' | 'en';
  initialChatId?: string;
  onSendMessage: (chatId: string, text: string) => void;
  onReceiveReply: (chatId: string, text: string) => void;
  onMarkAsRead: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteMessage?: (chatId: string, messageId: string, type: 'for-me' | 'for-everyone') => void;
  userAvatar?: string;
  isOwnerPerspective?: boolean;
}

// Fallback/default suggestions
const INITIAL_TELUGU_SUGGESTIONS = [
  'ఈ ధరలో డ్రైవర్ ఉంటారా?',
  'రేపు ఉదయం 7 గంటలకు యంత్రం వస్తుందా?',
  'యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?',
  'ధర కొంచెం తగ్గించడం కుదురుతుందా?',
  '2 రోజుల అద్దెకు ఎంత అవుతుంది?'
];

const INITIAL_TENGLISH_SUGGESTIONS = [
  'Driver untara bro?',
  'Repu udayam 7 am ki available untada?',
  'Yard ekkada undi, pickup ela chesukovali?',
  'Rate konchem taggisthara?',
  '2 days ki entha rent avuthundi?'
];

const INITIAL_ENGLISH_SUGGESTIONS = [
  'Is a driver included with this price?',
  'Is this machine available tomorrow at 7 AM?',
  'Where is the pickup location?',
  'Can we negotiate the price slightly?',
  'What is the best rate for 2 days?'
];

function VoiceMessagePlayable({ text, language }: { text: string; language: 'te' | 'en' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<any>(null);
  const durationMatch = (text || "").match(/\((\d+)s\)/);
  const durationSeconds = durationMatch ? parseInt(durationMatch[1], 10) : 5;

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const startProgress = progress >= 100 ? 0 : progress;
      if (progress >= 100) setProgress(0);

      const totalSteps = durationSeconds * 10;
      let currentStep = Math.floor((startProgress / 100) * totalSteps);
      
      progressInterval.current = setInterval(() => {
        currentStep++;
        const nextProgress = (currentStep / totalSteps) * 100;
        if (nextProgress >= 100) {
          setProgress(100);
          if (progressInterval.current) clearInterval(progressInterval.current);
          setIsPlaying(false);
        } else {
          setProgress(nextProgress);
        }
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const elapsedSeconds = Math.min(durationSeconds, Math.floor((progress / 100) * durationSeconds));

  return (
    <div className="flex items-center gap-3 bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-200/60 my-1 max-w-[280px] sm:max-w-xs shadow-3xs select-none">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={handlePlayPause}
        className="w-9 h-9 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-3xs focus:outline-none transition active:scale-95 cursor-pointer border-none"
      >
        {isPlaying ? (
          <div className="flex gap-1 items-center justify-center">
            <span className="w-1 h-3.5 bg-white rounded-full animate-pulse"></span>
            <span className="w-1 h-3.5 bg-white rounded-full animate-pulse [animation-delay:0.1s]"></span>
          </div>
        ) : (
          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
        )}
      </button>

      {/* Progress & Waveform */}
      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-0.5 h-6 mb-1">
          {Array.from({ length: 22 }).map((_, i) => {
            const baseHeight = Math.sin(i * 0.4) * 8 + 12;
            const isPlayed = (i / 22) * 100 <= progress;
            const activeHeight = isPlaying && isPlayed
              ? baseHeight + Math.sin(Date.now() / 150 + i) * 3
              : baseHeight;

            return (
              <span
                key={i}
                className="w-[3px] rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(4, activeHeight)}px`,
                  backgroundColor: isPlayed ? '#047857' : '#d1fae5',
                }}
              />
            );
          })}
        </div>

        {/* Playback Progress and Duration text */}
        <div className="flex items-center justify-between text-[8px] text-emerald-700 font-extrabold uppercase font-mono tracking-wider">
          <span>{`0:${elapsedSeconds < 10 ? `0${elapsedSeconds}` : elapsedSeconds}`}</span>
          <span className="flex items-center gap-0.5 text-emerald-600">
            <Mic className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
            {language === 'te' ? 'వాయిస్' : 'Voice'}
          </span>
          <span>{`0:${durationSeconds < 10 ? `0${durationSeconds}` : durationSeconds}`}</span>
        </div>
      </div>
    </div>
  );
}

export default function MessagesView({ 
  chats = [], 
  equipmentList = [], 
  language, 
  initialChatId,
  onSendMessage, 
  onReceiveReply, 
  onMarkAsRead,
  onDeleteChat,
  onDeleteMessage,
  userAvatar,
  isOwnerPerspective = false
}: MessagesViewProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);

  useEffect(() => {
    if (initialChatId) {
      setActiveChatId(initialChatId);
    } else if (!activeChatId && chats.length === 1) {
      setActiveChatId(chats[0].id);
    }
  }, [initialChatId, chats.length]);

  const [inputText, setInputText] = useState('');
  const [isOwnerTyping, setIsOwnerTyping] = useState(false);
  const [filterEquipmentId, setFilterEquipmentId] = useState<string | null>(null);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [deleteConfirmChatId, setDeleteConfirmChatId] = useState<string | null>(null);
  
  // WhatsApp-specific states
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);
  const [messageActionId, setMessageActionId] = useState<string | null>(null);
  const [deleteMessageConfirmId, setDeleteMessageConfirmId] = useState<string | null>(null);
  
  // Custom Voice Recording & Realtime Translation States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const recordingTimerRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic custom suggestions mapping per Chat ID
  const [dynamicSuggestions, setDynamicSuggestions] = useState<{ [chatId: string]: string[] }>({});
  const [suggestionMode, setSuggestionMode] = useState<'auto' | 'te' | 'te-en' | 'en'>('auto');

  const activeChat = chats.find(c => c.id === activeChatId);

  // Force-recalculate relative times dynamically
  const [timeTicker, setTimeTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker(prev => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Helper to parse timestamp from message ID or fall back to m.time
  const getRelativeOrPreciseTime = (m: ChatMessage) => {
    const parts = m.id.split('_');
    const lastPart = parts[parts.length - 1];
    const timestamp = parseInt(lastPart, 10);
    
    if (isNaN(timestamp) || timestamp < 1600000000000) {
      return m.time;
    }
    
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffMin < 1) {
      return language === 'te' ? 'ఇప్పుడే' : 'Just Now';
    }
    if (diffMin < 60) {
      return language === 'te' ? `${diffMin} నిమిషాల క్రితం` : `${diffMin}m ago`;
    }
    
    const dateObj = new Date(timestamp);
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mark chat as read when opening
  useEffect(() => {
    if (activeChatId) {
      onMarkAsRead(activeChatId);
    }
  }, [activeChatId]);

  // Scrolling triggers on messages change or typing
  useEffect(() => {
    const handleScroll = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };
    handleScroll();
    const t1 = setTimeout(handleScroll, 100);
    const t2 = setTimeout(handleScroll, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeChat?.messages?.length, isOwnerTyping, activeChatId]);

  // Close overlays when changing chat threads
  useEffect(() => {
    setEmojiPickerOpen(false);
    setAttachmentMenuOpen(false);
    setChatSearchOpen(false);
    setChatSearchQuery('');
    setProfileSidebarOpen(false);
    setMessageActionId(null);
  }, [activeChatId]);

  // Get active suggestions based on session history & language
  const currentSuggestions = useMemo(() => {
    if (!activeChat) return [];
    if (suggestionMode === 'te') return INITIAL_TELUGU_SUGGESTIONS;
    if (suggestionMode === 'te-en') return INITIAL_TENGLISH_SUGGESTIONS;
    if (suggestionMode === 'en') return INITIAL_ENGLISH_SUGGESTIONS;

    const activeDynamic = dynamicSuggestions[activeChat.id];
    if (activeDynamic && activeDynamic.length > 0) {
      return activeDynamic;
    }
    return language === 'en' ? INITIAL_ENGLISH_SUGGESTIONS : INITIAL_TELUGU_SUGGESTIONS;
  }, [activeChatId, dynamicSuggestions, language, suggestionMode, activeChat]);

  // Unique equipment/field options present in chats
  const uniqueEquipmentIdsInChats = useMemo(() => {
    return Array.from(new Set(chats.map(c => c.equipmentId).filter(Boolean))) as string[];
  }, [chats]);

  // Filtered chats list based on selected equipment filter chip and search query
  const filteredChats = useMemo(() => {
    let result = chats;
    if (filterEquipmentId) {
      result = result.filter(c => c.equipmentId === filterEquipmentId);
    }
    if (listSearchQuery.trim()) {
      const q = listSearchQuery.toLowerCase();
      result = result.filter(c => 
        c.contactName.toLowerCase().includes(q) || 
        c.lastMessage.toLowerCase().includes(q) ||
        (c.equipmentTitle && c.equipmentTitle.toLowerCase().includes(q))
      );
    }
    return result;
  }, [chats, filterEquipmentId, listSearchQuery]);

  // Combined message sending logic
  const sendChatMessage = (textToSend: string) => {
    if (!textToSend.trim() || !activeChatId || !activeChat) return;

    onSendMessage(activeChatId, textToSend);

    setTimeout(() => {
      setIsOwnerTyping(true);
    }, 350);

    const activeEquipment = equipmentList.find(eq => eq.id === activeChat.equipmentId) || {
      id: activeChat.equipmentId || '',
      title: activeChat.equipmentTitle || 'వ్యవసాయ పరికరం',
      titleEn: activeChat.equipmentTitle || 'Agricultural Machinery',
      price: 1000,
      rateType: 'hour',
      rateTypeLabel: 'గంట',
      location: 'అనంతపురము',
      locationEn: 'Anantapuramu',
      ownerName: activeChat.contactName,
      includesDriver: false
    };

    const currentMsgObj = {
      id: `temp_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
      sender: 'user' as const,
      text: textToSend,
      time: 'Just Now'
    };

    const updatedMessages = [
      ...activeChat.messages,
      currentMsgObj
    ];

    const payload = {
      message: textToSend,
      conversationHistory: activeChat.messages.map(m => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        time: m.time
      })),
      equipmentId: activeEquipment.id,
      equipmentContext: activeEquipment,
      // Backward compatibility fields
      equipment: activeEquipment,
      messages: updatedMessages,
      language
    };

    fetch('/api/gemini/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async res => {
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      setTimeout(() => {
        setIsOwnerTyping(false);
        const replyText = data?.reply || generateSmartMachineryResponse(textToSend, activeEquipment, language).reply;
        onReceiveReply(activeChatId, replyText);
        
        const suggestions = (data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0)
          ? data.suggestions
          : generateSmartMachineryResponse(textToSend, activeEquipment, language).suggestions;

        setDynamicSuggestions(prev => ({
          ...prev,
          [activeChatId]: suggestions
        }));
      }, 700);
    })
    .catch(err => {
      console.log("API reply fallback to client smart engine:", err?.message || err);
      setTimeout(() => {
        setIsOwnerTyping(false);
        const fallback = generateSmartMachineryResponse(textToSend, activeEquipment, language);
        onReceiveReply(activeChatId, fallback.reply);
        setDynamicSuggestions(prev => ({
          ...prev,
          [activeChatId]: fallback.suggestions
        }));
      }, 700);
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    sendChatMessage(textToSend);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    sendChatMessage(suggestionText);
  };

  // Helper to inject mock attachments directly as active user messages
  const sendMockAttachment = (type: 'doc' | 'camera' | 'image' | 'loc' | 'contact') => {
    setAttachmentMenuOpen(false);
    let mockText = '';
    
    if (type === 'doc') {
      mockText = language === 'te' 
        ? '📄 సహకార అద్దె ఒప్పందం పత్రం (Co-op Rent Lease.pdf) - 425 KB' 
        : '📄 Co-op Machinery Rental Lease Agreement.pdf - 425 KB';
    } else if (type === 'camera' || type === 'image') {
      mockText = language === 'te' 
        ? '📸 పొలం చిత్రం: యంత్రం తిరగడానికి అనుకూలమైన తడి నేల (Soil_Report.jpg)' 
        : '📸 Field Photo: Moist clay loam ready for rotary plow (Soil_Report.jpg)';
    } else if (type === 'loc') {
      mockText = language === 'te' 
        ? '📍 పొలం స్థానం GPS మ్యాప్: 14.68° N, 77.60° E (మొబైల్ ద్వారా లైవ్ లొకేషన్)' 
        : '📍 Farm Live Location GPS Map: 14.68° N, 77.60° E (Google Maps Link)';
    } else if (type === 'contact') {
      mockText = language === 'te' 
        ? '👤 సహకార సహాయ అధికారి ఫోన్: శేఖర్ రెడ్డి (+91 94405 84832)' 
        : '👤 Co-op Nodal Officer Contact: Shekhar Reddy (+91 94405 84832)';
    }

    sendChatMessage(mockText);
  };

  const handleQuickEmojiInsert = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setEmojiPickerOpen(false);
  };

  const startVoiceRecording = () => {
    setEmojiPickerOpen(false);
    setAttachmentMenuOpen(false);
    setIsRecording(true);
    setRecordingDuration(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const sendVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    const duration = recordingDuration > 0 ? recordingDuration : 5;
    sendChatMessage(`🎙️ Voice Message (${duration}s)`);
    setRecordingDuration(0);
  };

  const handleTranslateInput = async () => {
    if (!inputText.trim() || isTranslating) return;
    setIsTranslating(true);
    const targetLang = language === 'en' ? 'te' : 'en';

    try {
      const response = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: targetLang
        })
      });
      const data = await response.json();
      if (data && data.translatedText) {
        setInputText(data.translatedText);
      }
    } catch (err) {
      console.error("Translation API failed:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Find exact equipment associated with the current conversation thread
  const currentChatEquipment = useMemo(() => {
    if (!activeChat || !activeChat.equipmentId) return null;
    return equipmentList.find(e => e.id === activeChat.equipmentId);
  }, [activeChat, equipmentList]);

  // Filter messages based on within-chat search
  const filteredMessages = useMemo(() => {
    if (!activeChat) return [];
    return activeChat.messages;
  }, [activeChat]);

  // Helper to highlight matching characters for within-chat search
  const renderMessageContent = (msg: ChatMessage) => {
    const text = msg.text;
    const isDeleted = msg.isDeleted;

    if (isDeleted) {
      return (
        <p className="italic text-gray-400 text-xs flex items-center gap-1.5 py-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{text}</span>
        </p>
      );
    }

    // Special attachment styles rendered in custom high-fidelity cards
    if (text.startsWith('📄')) {
      return (
        <div className="bg-emerald-50 text-slate-800 p-2.5 rounded-xl border border-emerald-200/60 my-1 flex items-center gap-3 shadow-3xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-xs truncate text-emerald-950">
              {text.replace('📄 ', '')}
            </p>
            <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">
              {language === 'te' ? 'సహకార ఒప్పందం • PDF' : 'AGRI AGREEMENT • PDF'}
            </p>
          </div>
          <button 
            type="button"
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition shadow-3xs cursor-pointer shrink-0"
            onClick={() => alert(language === 'te' ? 'పత్రాన్ని డౌన్‌లోడ్ చేయండి' : 'Downloading cooperative document...')}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (text.startsWith('📸')) {
      return (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-150 my-1 shadow-3xs">
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=60" 
            alt="Field soil" 
            className="w-full h-32 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="p-2 bg-slate-50 border-t border-slate-100">
            <p className="text-[11px] font-bold text-gray-700 leading-tight">
              {text.replace('📸 ', '')}
            </p>
          </div>
        </div>
      );
    }

    if (text.startsWith('🚜')) {
      // Official Equipment Booking Order with Owner & Farmer contact details
      const ownerPhone = activeChat?.contactPhone || activeChat?.ownerPhone || '';
      return (
        <div className="bg-emerald-50/90 text-slate-800 p-3 rounded-2xl border border-emerald-200/80 my-1.5 shadow-2xs space-y-2 max-w-md">
          <div className="flex items-center justify-between border-b border-emerald-100/80 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1b6d24] flex items-center gap-1.5">
              <span>🚜</span>
              <span>{language === 'te' ? 'యంత్ర బుకింగ్ నిర్ధారణ' : 'Equipment Booking Confirmation'}</span>
            </span>
            <span className="bg-emerald-200/70 text-[#1b6d24] text-[9px] font-black px-2 py-0.5 rounded-full">
              {language === 'te' ? 'నమోదైంది' : 'Confirmed'}
            </span>
          </div>

          <div className="text-[11.5px] whitespace-pre-wrap leading-relaxed font-medium text-slate-850">
            {text}
          </div>

          {ownerPhone && (
            <div className="pt-2 border-t border-emerald-100 flex items-center justify-between gap-2">
              <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-700" />
                <span>{language === 'te' ? 'యజమాని నంబర్:' : 'Owner Phone:'} {ownerPhone}</span>
              </span>
              <a 
                href={`tel:${ownerPhone}`}
                className="bg-[#1b6d24] hover:bg-[#15541b] text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-3xs transition"
              >
                <Phone className="w-3 h-3" />
                <span>{language === 'te' ? 'కాల్ చేయండి' : 'Call Owner'}</span>
              </a>
            </div>
          )}
        </div>
      );
    }

    if (text.startsWith('📍')) {
      return (
        <div className="bg-[#f0f4f1] text-slate-800 p-2.5 rounded-xl border border-slate-200/80 my-1 flex flex-col gap-2 shadow-3xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-xs text-gray-800 truncate">
                {language === 'te' ? 'లైవ్ ఫీల్డ్ లొకేషన్ మ్యాప్' : 'Live Field GPS Location'}
              </p>
              <p className="text-[9.5px] text-gray-400 font-extrabold truncate">
                {text.replace('📍 ', '')}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            onClick={() => window.open('https://maps.google.com/?q=14.68,77.60', '_blank')}
          >
            <Map className="w-3.5 h-3.5 text-white" />
            <span>{language === 'te' ? 'గూగుల్ మ్యాప్స్‌లో చూడండి' : 'Open in Google Maps'}</span>
          </button>
        </div>
      );
    }

    if (text.startsWith('👤')) {
      return (
        <div className="bg-amber-50/50 text-slate-800 p-2.5 rounded-xl border border-amber-200/60 my-1 flex items-center justify-between gap-2.5 shadow-3xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <User className="w-4 h-4 text-amber-800" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-xs text-amber-950 truncate">
                {text.replace('👤 ', '').split(':')[0]}
              </p>
              <p className="text-[10px] text-amber-700 font-bold truncate">
                {text.includes(':') ? text.split(':')[1] : ''}
              </p>
            </div>
          </div>
          <a 
            href="tel:+919440584832"
            className="w-8 h-8 rounded-full bg-white text-amber-700 border border-amber-200 flex items-center justify-center shadow-3xs hover:bg-amber-50 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-amber-700" />
          </a>
        </div>
      );
    }

    if (text.startsWith('🎙️')) {
      return <VoiceMessagePlayable text={text} language={language} />;
    }

    // Highlighting for search query matches inside active conversation
    if (chatSearchQuery.trim()) {
      const q = chatSearchQuery.toLowerCase();
      const parts = text.split(new RegExp(`(${q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
      return (
        <p className="whitespace-pre-wrap leading-relaxed text-[11.5px] font-semibold text-gray-800">
          {parts.map((part, i) => 
            part.toLowerCase() === q 
              ? <mark key={i} className="bg-yellow-200 text-black px-0.5 rounded font-black">{part}</mark> 
              : part
          )}
        </p>
      );
    }

    return <p className="whitespace-pre-wrap leading-relaxed text-[11.5px] font-semibold text-gray-800">{text}</p>;
  };

  if (activeChatId && activeChat) {
    return (
      <div className="fixed inset-0 z-50 bg-[#efeae2] flex max-w-md mx-auto md:max-w-4xl animate-scale-up border-x border-gray-200 shadow-xl overflow-hidden">
        
        {/* Main WhatsApp Screen Panel */}
        <div className="flex-1 flex flex-col relative h-full">
          
          {/* WhatsApp Header styling */}
          <header className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center gap-3 shadow-md z-10 shrink-0 select-none">
            <button
              onClick={() => {
                setActiveChatId(null);
                setIsOwnerTyping(false);
              }}
              className="p-1 hover:bg-white/10 rounded-full transition-colors duration-150 focus:outline-none"
              id="btn-chat-back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {/* Contact Details (Clickable to open Lender profile) */}
            <div 
              onClick={() => setProfileSidebarOpen(true)}
              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                {activeChat.contactAvatar ? (
                  <img
                    src={activeChat.contactAvatar}
                    alt={activeChat.contactName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-extrabold text-xs tracking-wide text-white truncate flex items-center gap-1">
                  <span>{activeChat.contactName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </h3>
                
                <div className="flex items-center gap-1.5 text-[10px] text-green-100 font-bold truncate">
                  {isOwnerTyping ? (
                    <span className="text-emerald-300 font-black animate-pulse">
                      {language === 'te' ? 'టైప్ చేస్తున్నారు...' : 'typing...'}
                    </span>
                  ) : (
                    <span>{language === 'te' ? 'ఆన్‌లైన్' : 'online'}</span>
                  )}
                  {activeChat.contactPhone && (
                    <>
                      <span>•</span>
                      <a 
                        href={`tel:${activeChat.contactPhone}`}
                        onClick={(e) => e.stopPropagation()} 
                        className="hover:underline text-emerald-200 flex items-center gap-0.5"
                      >
                        <Phone className="w-2.5 h-2.5 text-emerald-300" />
                        <span>{activeChat.contactPhone}</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons list */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Specs action button */}
              {currentChatEquipment && (
                <button
                  onClick={() => setShowSpecsModal(true)}
                  className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-black tracking-wide flex items-center gap-1 cursor-pointer transition focus:outline-none"
                  title="View Equipment Specifications"
                  id="btn-view-embedded-specs"
                >
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span>{language === 'te' ? 'వివరాలు' : 'Specs'}</span>
                </button>
              )}

              {/* Call button */}
              <a
                href={`tel:${activeChat.contactPhone}`}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors focus:outline-none shrink-0"
                title={language === 'te' ? 'కాల్ చేయండి' : 'Call Owner'}
                id="link-call-owner"
              >
                <Phone className="w-4 h-4 text-white" />
              </a>

              {/* Search within-chat toggle */}
              <button
                onClick={() => setChatSearchOpen(!chatSearchOpen)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors focus:outline-none shrink-0 cursor-pointer ${
                  chatSearchOpen ? 'bg-white/25 text-white' : 'hover:bg-white/10 text-white'
                }`}
                title={language === 'te' ? 'చాట్‌లో వెతకండి' : 'Search Chat'}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Profile details trigger */}
              <button
                onClick={() => setProfileSidebarOpen(true)}
                className="w-8 h-8 rounded-full hover:bg-white/10 text-white/95 flex items-center justify-center transition-colors focus:outline-none shrink-0 cursor-pointer"
                title={language === 'te' ? 'ప్రొఫైల్ సమాచారం' : 'Contact Info'}
              >
                <InfoIcon className="w-4 h-4" />
              </button>

              {/* Delete Entire Chat button */}
              <button
                onClick={() => setDeleteConfirmChatId(activeChat.id)}
                className="w-8 h-8 rounded-full hover:bg-white/10 hover:text-red-200 text-white/90 flex items-center justify-center transition-colors focus:outline-none shrink-0 cursor-pointer"
                title={language === 'te' ? 'చాట్‌ను తొలగించండి' : 'Delete Chat'}
                id="btn-delete-active-chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Within-Chat Search Input Overlay */}
          {chatSearchOpen && (
            <div className="bg-[#efeae2]/95 border-b border-gray-200 px-4 py-2 flex items-center gap-2 animate-slide-down shadow-xs shrink-0 z-10">
              <Search className="w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder={language === 'te' ? "సందేశాలను వెతకండి..." : "Search messages in this chat..."}
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                className="flex-1 bg-white border border-gray-300 text-xs py-1.5 px-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#075e54]"
                autoFocus
              />
              {chatSearchQuery && (
                <button 
                  onClick={() => setChatSearchQuery('')}
                  className="text-gray-500 hover:text-gray-800 text-xs font-bold px-1"
                >
                  Clear
                </button>
              )}
              <button 
                onClick={() => {
                  setChatSearchOpen(false);
                  setChatSearchQuery('');
                }}
                className="text-xs text-[#075e54] font-black cursor-pointer px-1"
              >
                Done
              </button>
            </div>
          )}

          {/* Detailed Machinery Info Strip */}
          {currentChatEquipment && (
            <div className="bg-white/95 px-4 py-2 border-b border-gray-200/80 shadow-3xs flex flex-col gap-1 shrink-0 animate-fade-in z-5">
              <div className="flex gap-3 items-center">
                <img
                  src={currentChatEquipment.imageUrl}
                  alt={currentChatEquipment.title}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-100 shadow-3xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-gray-900 truncate">
                      {language === 'te' ? currentChatEquipment.title : currentChatEquipment.titleEn || currentChatEquipment.title}
                    </h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-100">
                      ₹{currentChatEquipment.price}/{language === 'te' ? currentChatEquipment.rateTypeLabel : currentChatEquipment.rateType}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[9.5px] font-bold text-gray-400">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {language === 'te' ? currentChatEquipment.location : currentChatEquipment.locationEn}
                    </span>
                    {currentChatEquipment.horsepower && (
                      <span>• {currentChatEquipment.horsepower}</span>
                    )}
                    <span>
                      • {currentChatEquipment.includesDriver 
                        ? (language === 'te' ? 'ఆపరేటర్ ఉచితం' : 'Driver Included') 
                        : (language === 'te' ? 'డ్రైవర్ లేదు' : 'No Driver')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Scrolling Area with WhatsApp doodle styled background */}
          <div 
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 no-scrollbar flex flex-col"
            style={{
              backgroundColor: '#efeae2',
              backgroundImage: 'radial-gradient(#dfdcd6 1.2px, transparent 1.2px), radial-gradient(#dfdcd6 1.2px, #efeae2 1.2px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px'
            }}
          >
            {/* Safe Welcome Note */}
            <div className="mx-auto my-1 max-w-[340px]">
              <div className="bg-[#f0fbf0] border border-emerald-200/80 rounded-xl p-2 shadow-3xs text-center">
                <p className="text-[9.5px] leading-relaxed text-emerald-900 font-bold">
                  {language === 'te' 
                    ? '🤖 స్మార్ట్ AI సహకారి సిద్ధంగా ఉన్నారు: తెలుగు, Tenglish లేదా English లో ఏ ప్రశ్నైనా అడగండి!' 
                    : '🤖 Smart AI Agent ready: Ask anything in Telugu, Tenglish, or English!'}
                </p>
              </div>
            </div>

            {filteredMessages.map((m) => {
              const isUser = isOwnerPerspective ? m.sender === 'owner' : m.sender === 'user';
              const dynamicTime = getRelativeOrPreciseTime(m);
              const isDeleted = m.isDeleted;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col relative group max-w-[80%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
                  id={`chat-bubble-${m.id}`}
                >
                  {/* WhatsApp styled bubble body */}
                  <div
                    onClick={() => {
                      if (!isDeleted) {
                        setMessageActionId(messageActionId === m.id ? null : m.id);
                      }
                    }}
                    className={`relative rounded-xl px-3 py-1.5 pb-5 text-left text-xs leading-relaxed shadow-3xs transition-all cursor-pointer ${
                      isUser
                        ? isDeleted 
                          ? 'bg-emerald-100/40 text-gray-400 border border-emerald-100 rounded-tr-none' 
                          : 'bg-[#d9fdd3] text-gray-800 hover:bg-[#cbfbc3] rounded-tr-none'
                        : isDeleted 
                          ? 'bg-white/40 text-gray-400 border border-slate-200 rounded-tl-none' 
                          : 'bg-white text-gray-800 hover:bg-slate-50 rounded-tl-none'
                    }`}
                  >
                    {/* Render customized bubble components based on attachments */}
                    {renderMessageContent(m)}

                    {/* WhatsApp style time & ticks inside the bubble bottom right corner */}
                    <div className="absolute bottom-0.5 right-1.5 flex items-center gap-1 select-none">
                      <span className="text-[8px] text-gray-400 font-bold font-mono uppercase tracking-tight">
                        {dynamicTime}
                      </span>
                      {isUser && !isDeleted && (
                        // If it's the user's message, render ticks.
                        // For mock effect, older messages get double-blue ticks, recent gets single or double grey
                        m.id.startsWith('temp_') ? (
                          <Check className="w-3 h-3 text-gray-400" />
                        ) : (
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        )
                      )}
                    </div>

                    {/* Micro dropdown button visible on bubble hover */}
                    {!isDeleted && (
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white/90 pl-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setMessageActionId(messageActionId === m.id ? null : m.id);
                          }}
                          className="text-gray-400 hover:text-gray-700 focus:outline-none p-0.5 rounded"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Action Options Context Menu Dropdown */}
                  {messageActionId === m.id && (
                    <div className="absolute z-20 bg-white border border-gray-150 rounded-2xl shadow-xl p-1.5 py-1 w-44 top-full mt-1 flex flex-col text-left text-xs animate-scale-up">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(m.text);
                          setMessageActionId(null);
                          alert(language === 'te' ? 'కాపీ చేయబడింది' : 'Message copied to clipboard!');
                        }}
                        className="w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-bold text-gray-600 transition"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'te' ? 'కాపీ చేయి' : 'Copy Text'}</span>
                      </button>

                      {onDeleteMessage && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMessage(activeChat.id, m.id, 'for-me');
                              setMessageActionId(null);
                            }}
                            className="w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold transition"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>{language === 'te' ? 'నా కోసం డిలీట్ చేయి' : 'Delete for Me'}</span>
                          </button>
                          
                          {isUser && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteMessage(activeChat.id, m.id, 'for-everyone');
                                setMessageActionId(null);
                              }}
                              className="w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-red-100 text-red-700 flex items-center gap-2 font-extrabold transition border-t border-slate-100 mt-1"
                            >
                              <X className="w-3.5 h-3.5 text-red-500" />
                              <span>{language === 'te' ? 'అందరి కోసం డిలీట్ చేయి' : 'Delete for Everyone'}</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isOwnerTyping && (
              <div className="flex gap-2 items-end self-start animate-pulse max-w-[80%]" id="owner-typing-indicator">
                <div className="bg-white text-gray-700 rounded-xl rounded-tl-none border border-slate-150 px-3 py-1.5 shadow-3xs flex items-center gap-1.5">
                  <div className="flex gap-1 items-center shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[9.5px] font-bold text-gray-500">
                    {language === 'te' ? 'టైప్ చేస్తున్నారు...' : 'Typing...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Smart Responses Carousel */}
          <div className="bg-white px-3 py-2 border-t border-gray-150 select-none shrink-0 z-5">
            <div className="flex items-center justify-between gap-1 mb-1.5 text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#1b6d24]" />
                <span>
                  {language === 'te' 
                    ? 'శీఘ్ర ప్రశ్నలు (Quick Questions)' 
                    : 'Smart Quick Questions (Click to send)'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSuggestionMode('te')}
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold cursor-pointer transition ${suggestionMode === 'te' ? 'bg-[#1b6d24] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  తెలుగు
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestionMode('te-en')}
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold cursor-pointer transition ${suggestionMode === 'te-en' ? 'bg-[#1b6d24] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Tenglish
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestionMode('en')}
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold cursor-pointer transition ${suggestionMode === 'en' ? 'bg-[#1b6d24] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  English
                </button>
              </div>
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              {currentSuggestions.map((suggestionText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestionText)}
                  className="shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold py-1.5 px-3 rounded-full border border-emerald-200 active:scale-95 transition-all text-left cursor-pointer"
                  id={`suggestion-chip-${idx}`}
                >
                  {suggestionText}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp style Attachments Floating Menu */}
          {attachmentMenuOpen && (
            <div className="absolute bottom-16 left-4 z-40 bg-white rounded-2xl shadow-xl border border-gray-150 p-3.5 flex gap-3.5 animate-scale-up">
              {/* Document attachment */}
              <button 
                type="button"
                onClick={() => sendMockAttachment('doc')}
                className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none hover:scale-105 transition"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-[8.5px] font-bold text-gray-500">{language === 'te' ? 'పత్రం' : 'Document'}</span>
              </button>

              {/* Camera photo */}
              <button 
                type="button"
                onClick={() => sendMockAttachment('camera')}
                className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none hover:scale-105 transition"
              >
                <div className="w-10 h-10 rounded-full bg-[#ec407a] text-white flex items-center justify-center shadow-md">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-[8.5px] font-bold text-gray-500">{language === 'te' ? 'కెమెరా' : 'Camera'}</span>
              </button>

              {/* Gallery photo */}
              <button 
                type="button"
                onClick={() => sendMockAttachment('image')}
                className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none hover:scale-105 transition"
              >
                <div className="w-10 h-10 rounded-full bg-[#ab47bc] text-white flex items-center justify-center shadow-md">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-[8.5px] font-bold text-gray-500">{language === 'te' ? 'గ్యాలరీ' : 'Gallery'}</span>
              </button>

              {/* Map Location */}
              <button 
                type="button"
                onClick={() => sendMockAttachment('loc')}
                className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none hover:scale-105 transition"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-[8.5px] font-bold text-gray-500">{language === 'te' ? 'లొకేషన్' : 'Location'}</span>
              </button>

              {/* Contact card */}
              <button 
                type="button"
                onClick={() => sendMockAttachment('contact')}
                className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none hover:scale-105 transition"
              >
                <div className="w-10 h-10 rounded-full bg-[#42a5f5] text-white flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-[8.5px] font-bold text-gray-500">{language === 'te' ? 'పరిచయం' : 'Contact'}</span>
              </button>
            </div>
          )}

          {/* WhatsApp style Emojis Quick Tray drawer */}
          {emojiPickerOpen && (
            <div className="absolute bottom-16 left-4 z-40 bg-white rounded-2xl shadow-xl border border-gray-150 p-2.5 flex flex-wrap gap-2.5 w-60 animate-scale-up select-none">
              {['🚜', '🌱', '🌾', '🍅', '🤝', '👍', '❤️', '😂', '😮', '😢', '🙏', '😊', '📅', '📍', '💰', '📞'].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => handleQuickEmojiInsert(em)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-lg active:scale-90 transition cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          {/* WhatsApp Input controls Bar */}
          <form onSubmit={handleSend} className="bg-[#f0f0f0] p-2.5 flex gap-2 items-center shrink-0 border-t border-slate-200 min-h-[62px]">
            {isRecording ? (
              <div className="flex-1 flex items-center justify-between bg-white rounded-full px-4 py-2 border border-slate-200 shadow-3xs animate-scale-up select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                  <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                    {language === 'te' ? 'రికార్డింగ్...' : 'Recording...'}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-550 bg-slate-100 px-2 py-0.5 rounded ml-1">
                    {`0:${recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}`}
                  </span>
                </div>

                <div className="flex gap-0.5 items-center justify-center py-1">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((w, i) => (
                    <span 
                      key={i}
                      className="w-0.5 bg-red-500 rounded-full animate-bounce"
                      style={{
                        height: `${Math.max(4, w * 3 + Math.sin(Date.now() / 150 + i) * 2)}px`,
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: '0.6s'
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelVoiceRecording}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-full transition cursor-pointer border-none bg-transparent"
                    title={language === 'te' ? 'రద్దు చేయి' : 'Cancel Recording'}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  <button
                    type="button"
                    onClick={sendVoiceRecording}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition cursor-pointer shadow-3xs border-none"
                    title={language === 'te' ? 'పంపించు' : 'Send Voice Message'}
                  >
                    <SendHorizontal className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Emojis trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setEmojiPickerOpen(!emojiPickerOpen);
                    setAttachmentMenuOpen(false);
                  }}
                  className={`p-2 rounded-full hover:bg-slate-200 focus:outline-none shrink-0 cursor-pointer border-none bg-transparent ${emojiPickerOpen ? 'bg-slate-200 text-amber-500' : 'text-gray-550'}`}
                  title={language === 'te' ? 'ఎమోజీలు' : 'Emojis'}
                >
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>

                {/* Paperclip trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentMenuOpen(!attachmentMenuOpen);
                    setEmojiPickerOpen(false);
                  }}
                  className={`p-2 rounded-full hover:bg-slate-200 focus:outline-none shrink-0 cursor-pointer border-none bg-transparent ${attachmentMenuOpen ? 'bg-slate-200 text-[#075e54]' : 'text-gray-550'}`}
                  title={language === 'te' ? 'జతచేయి' : 'Attach File'}
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>

                {/* Main Text Input field */}
                <div className="flex-1 relative flex items-center bg-white rounded-full border border-gray-200 shadow-3xs focus-within:ring-1 focus-within:ring-emerald-700 focus-within:border-transparent transition-all">
                  <input
                    type="text"
                    placeholder={language === 'te' ? "సందేశం పంపండి..." : "Type your message..."}
                    className="flex-1 bg-transparent text-gray-850 font-semibold text-xs pl-3.5 pr-20 py-2.5 focus:outline-none border-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    id="input-chat-message"
                    autoComplete="off"
                  />
                  
                  {/* Translate Action Button */}
                  {inputText.trim() && (
                    <button
                      type="button"
                      onClick={handleTranslateInput}
                      disabled={isTranslating}
                      className={`absolute right-2 px-2.5 py-1 flex items-center gap-1 hover:bg-emerald-50 text-emerald-800 text-[9px] font-extrabold cursor-pointer select-none transition border border-emerald-100 bg-emerald-50/40 rounded-full ${isTranslating ? 'animate-pulse opacity-60' : ''}`}
                      title={language === 'te' ? 'ఆంగ్లంలోకి/తెలుగులోకి అనువదించు' : 'Translate between languages'}
                    >
                      <Languages className="w-3 h-3 text-emerald-600" />
                      <span>{isTranslating ? '...' : (language === 'te' ? 'English' : 'తెలుగు')}</span>
                    </button>
                  )}
                </div>

                {/* Dynamic Send / Microphone mock voice note icon */}
                {inputText.trim() ? (
                  <button
                    type="submit"
                    className="bg-[#008069] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#075e54] active:scale-90 transition-transform shadow-md shrink-0 cursor-pointer border-none"
                    id="btn-send-message"
                  >
                    <SendHorizontal className="w-4.5 h-4.5 text-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className="bg-[#008069] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#075e54] active:scale-90 transition-transform shadow-md shrink-0 cursor-pointer border-none animate-pulse"
                    title={language === 'te' ? 'వాయిస్ సందేశం రికార్డ్ చేయి' : 'Record voice note'}
                  >
                    <Mic className="w-4.5 h-4.5 text-white" />
                  </button>
                )}
              </>
            )}
          </form>

          {/* Specifications Overlay Drawer */}
          {showSpecsModal && currentChatEquipment && (
            <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-3xs flex items-end sm:items-center justify-center p-3">
              <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border max-h-[85vh] flex flex-col">
                {/* Modal Header */}
                <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-300" />
                    <span className="text-xs font-black tracking-normal uppercase text-white">
                      {language === 'te' ? 'యంత్ర పూర్తి వివరాలు' : 'Machinery Specifications'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSpecsModal(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-white focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable specs sheet */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-medium text-gray-600 no-scrollbar">
                  <img
                    src={currentChatEquipment.imageUrl}
                    alt={currentChatEquipment.title}
                    className="w-full h-40 object-cover rounded-2xl border border-emerald-50 shadow-xs"
                    referrerPolicy="no-referrer"
                  />

                  <div>
                    <h3 className="text-sm font-black text-gray-900 leading-tight">
                      {language === 'te' ? currentChatEquipment.title : currentChatEquipment.titleEn || currentChatEquipment.title}
                    </h3>
                    <p className="text-[10px] text-emerald-700 font-bold mt-1 inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                      📍 {language === 'te' ? currentChatEquipment.location : currentChatEquipment.locationEn}
                    </p>
                  </div>

                  {/* Specs parameters table */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 text-left">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="font-extrabold text-gray-400">{language === 'te' ? 'కేటగిరీ:' : 'Category:'}</span>
                      <span className="font-black text-gray-800 capitalize">{currentChatEquipment.category}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="font-extrabold text-gray-400">{language === 'te' ? 'ధర రూపం:' : 'Cooperative Rent:'}</span>
                      <span className="font-black text-emerald-800">₹{currentChatEquipment.price} / {language === 'te' ? currentChatEquipment.rateTypeLabel : currentChatEquipment.rateType}</span>
                    </div>
                    {currentChatEquipment.horsepower && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="font-extrabold text-gray-400">{language === 'te' ? 'శక్తి సామర్థ్యం:' : 'Horsepower:'}</span>
                        <span className="font-black text-gray-800">{currentChatEquipment.horsepower}</span>
                      </div>
                    )}
                    {currentChatEquipment.fuelType && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="font-extrabold text-gray-400">{language === 'te' ? 'ఇంధనం రకం:' : 'Fuel Type:'}</span>
                        <span className="font-black text-gray-800">{currentChatEquipment.fuelType}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1">
                      <span className="font-extrabold text-gray-400">{language === 'te' ? 'డ్రైవర్ ఆపరేషన్:' : 'Operator Status:'}</span>
                      <span className="font-black text-gray-800 bg-white/80 border px-2 py-0.5 rounded text-[10px]">
                        {currentChatEquipment.includesDriver 
                          ? (language === 'te' ? 'ఆపరేటర్ చేర్చబడ్డారు' : 'Driver Provided - Free') 
                          : (language === 'te' ? 'డ్రైవర్ రారు' : 'Self-Driven only')}
                      </span>
                    </div>
                  </div>

                  {/* Safety Seal */}
                  <div className="bg-emerald-55/10 border border-emerald-500/15 rounded-xl p-2.5 flex items-start gap-2 text-[10.5px] text-emerald-950 font-bold text-left">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{language === 'te' ? 'భరోసా: సున్నా బ్రోకరేజ్ సహకార లోజిస్టిక్స్ రక్షణ.' : 'AP Co-op Verified: Secure payments with logistics escrow support.'}</span>
                  </div>
                </div>

                {/* Modal Footer actions */}
                <div className="px-4 py-3 bg-slate-50 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSpecsModal(false)}
                    className="bg-emerald-800 text-white font-black text-xs px-4 py-2 rounded-xl hover:bg-emerald-900 cursor-pointer transition"
                  >
                    {language === 'te' ? 'తిరిగి చాట్ లోకి వెళ్లు' : 'Back to Chat'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp sliding Right Sidebar (Contact/Lender Profile Details) */}
        {profileSidebarOpen && (
          <div className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col h-full animate-slide-left shrink-0 z-30 relative select-none">
            {/* Header */}
            <div className="bg-[#075e54] text-white px-4 py-4 flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setProfileSidebarOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-black uppercase tracking-wide">
                {language === 'te' ? 'యజమాని ప్రొఫైల్' : 'Contact Info'}
              </h3>
            </div>

            {/* Scrollable contact profile details */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left no-scrollbar">
              {/* Profile image & basic info */}
              <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-100">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden shadow-md">
                  {activeChat.contactAvatar ? (
                    <img 
                      src={activeChat.contactAvatar} 
                      alt={activeChat.contactName} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400 mt-4 mx-auto" />
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-800 flex items-center justify-center gap-1.5">
                    <span>{activeChat.contactName}</span>
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full border border-emerald-300">
                      ✓
                    </span>
                  </h4>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">{activeChat.contactPhone}</p>
                </div>
              </div>

              {/* Cooperative Trust Stats */}
              <div className="space-y-3">
                <h5 className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  {language === 'te' ? 'సహకార సంఘం రేటింగ్' : 'Cooperative Platform Trust'}
                </h5>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-450 font-bold">{language === 'te' ? 'స్టేటస్:' : 'Co-op Status:'}</span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[9px] border border-emerald-100">
                      {language === 'te' ? 'ధృవీకరించబడిన యజమాని' : 'Verified Lender'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-450 font-bold">{language === 'te' ? 'సభ్యత్వ సంఖ్య:' : 'Member ID:'}</span>
                    <span className="font-bold text-gray-700 font-mono text-[10px]">AP-COOP-{activeChat.contactPhone.slice(-4)}-2026</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-450 font-bold">{language === 'te' ? 'రేటింగ్:' : 'Lender Rating:'}</span>
                    <span className="font-black text-amber-600 flex items-center gap-0.5">
                      ★ 4.9 (24 {language === 'te' ? 'బుకింగ్స్' : 'shares'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Shared Machinery */}
              {activeChat.equipmentTitle && (
                <div className="space-y-2.5">
                  <h5 className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                    {language === 'te' ? 'అద్దెకు ఇచ్చే యంత్రం' : 'Associated Agri Machinery'}
                  </h5>
                  <div className="bg-emerald-50/40 rounded-xl p-3 border border-emerald-100 flex items-center gap-2.5">
                    {activeChat.equipmentImage && (
                      <img 
                        src={activeChat.equipmentImage} 
                        alt="Machine" 
                        className="w-10 h-10 rounded-lg object-cover border shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-emerald-950 truncate">{activeChat.equipmentTitle}</p>
                      <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5">{language === 'te' ? 'గంటల ఆధారిత అద్దె' : 'Available on immediate dispatch'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shared Media, Links & Docs mock section */}
              <div className="space-y-2.5">
                <h5 className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  {language === 'te' ? 'మీడియా మరియు డాక్యుమెంట్లు' : 'Media, Links and Docs'}
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                    <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=150" alt="media1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex flex-col items-center justify-center text-emerald-700 font-bold p-1">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="text-[8px] mt-0.5 truncate w-full text-center">Lease.pdf</span>
                  </div>
                  <div className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                    +3
                  </div>
                </div>
              </div>

              {/* Mute and Block Options */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 select-none">
                <button
                  type="button"
                  onClick={() => alert(language === 'te' ? 'నోటిఫికేషన్లు మ్యూట్ చేయబడ్డాయి' : 'Conversations muted for 8 hours.')}
                  className="w-full text-left py-2 px-1 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <BellOff className="w-4 h-4 text-slate-400" />
                  <span>{language === 'te' ? 'నోటిఫికేషన్లు మ్యూట్ చేయి' : 'Mute Notifications'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => alert(language === 'te' ? 'యజమాని సురక్షితంగా నిరోధించబడ్డారు' : 'Lender has been flagged. Cooperative team informed.')}
                  className="w-full text-left py-2 px-1 rounded-lg hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>{language === 'te' ? 'సంప్రదింపును బ్లాక్ చేయి' : 'Block Lender'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Delete Chat Modal */}
        {deleteConfirmChatId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-3xs flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border border-slate-100 p-5 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-sm font-black text-slate-800">
                  {language === 'te' ? 'చాట్‌ను తొలగించాలా?' : 'Delete Conversation?'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                {language === 'te' 
                  ? 'ఈ సంభాషణ మరియు మెసేజ్ చరిత్ర అంతా శాశ్వతంగా తొలగించబడుతుంది. దీనిని తిరిగి పొందలేరు.' 
                  : 'This will permanently delete your chat conversation history. This action cannot be undone.'}
              </p>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmChatId(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 focus:outline-none"
                >
                  {language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmChatId) {
                      onDeleteChat(deleteConfirmChatId);
                      if (activeChatId === deleteConfirmChatId) {
                        setActiveChatId(null);
                      }
                      setDeleteConfirmChatId(null);
                    }
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 focus:outline-none"
                  id="btn-confirm-delete-chat"
                >
                  {language === 'te' ? 'డిలీట్ చేయి' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Chats list screen view
  return (
    <div className="pb-24 animate-fade-in px-5 mt-4 max-w-md mx-auto md:max-w-2xl select-none">
      {/* Title */}
      <div className="mb-4 text-left">
        <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-1.5">
          {language === 'te' ? 'సందేశాలు (Agri Chats)' : 'Messages'}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {language === 'te' ? 'మీ అద్దె మరియు యజమానుల సంభాషణలు' : 'Your rental agreements and logistics conversations'}
        </p>
      </div>

      {/* WhatsApp style list Search bar */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder={language === 'te' ? "చాట్‌లను వెతకండి..." : "Search or start a new chat..."}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200/80 rounded-2xl text-xs font-semibold text-gray-800 placeholder-gray-400 shadow-3xs focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-all text-left"
          value={listSearchQuery}
          onChange={(e) => setListSearchQuery(e.target.value)}
        />
        {listSearchQuery && (
          <button 
            type="button"
            onClick={() => setListSearchQuery('')}
            className="absolute inset-y-0 right-3.5 text-xs text-gray-450 hover:text-gray-700 font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Equipment-level filter chip desk so we can select / read and chat with the person in "the particular field" */}
      {uniqueEquipmentIdsInChats.length > 0 && (
        <div className="mb-4 bg-white border border-gray-100 rounded-2xl p-3 shadow-3xs text-left">
          <p className="text-[9.5px] text-gray-400 font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[#1b6d24]" />
            <span>{language === 'te' ? 'యంత్రం/ఫీల్డ్ ఆధారంగా సంభాషణలు వడపోత:' : 'Filter Chats by Specific Field/Machine:'}</span>
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            <button
              onClick={() => setFilterEquipmentId(null)}
              className={`shrink-0 text-[10px] font-extrabold px-3 py-1.5 rounded-full transition-all border ${
                filterEquipmentId === null
                  ? 'bg-[#1b6d24] text-white border-[#1b6d24]'
                  : 'bg-slate-50 text-slate-600 border-slate-150 hover:bg-slate-100'
              }`}
            >
              {language === 'te' ? 'అన్నీ (All)' : 'All Fields'}
            </button>
            {uniqueEquipmentIdsInChats.map((eqId) => {
              const eqObj = equipmentList.find(e => e.id === eqId);
              const titleText = eqObj 
                ? (language === 'te' ? eqObj.title : eqObj.titleEn || eqObj.title)
                : (chats.find(c => c.equipmentId === eqId)?.equipmentTitle || 'Equipment');
              return (
                <button
                  key={eqId}
                  onClick={() => setFilterEquipmentId(eqId)}
                  className={`shrink-0 text-[10px] font-extrabold px-3 py-1.5 rounded-full transition-all border flex items-center gap-1.5 ${
                    filterEquipmentId === eqId
                      ? 'bg-[#1b6d24] text-white border-[#1b6d24]'
                      : 'bg-white text-slate-600 border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{titleText}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filteredChats.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 py-16 text-center border border-gray-100 shadow-3xs flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3 text-[#1b6d24]">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h4 className="text-xs font-bold text-gray-700">
            {language === 'te' ? 'ఎటువంటి చాట్లు కనుగొనబడలేదు' : 'No chats found matching filter'}
          </h4>
          <p className="text-[10px] text-gray-400 mt-1 max-w-[220px] leading-relaxed">
            {language === 'te'
              ? 'శోధన పేజీ ద్వారా మీ బుకింగ్ చాట్ శీఘ్రంగా ప్రారంభించండి!'
              : 'Browse active physical listings and initiate secure chatting with lender owners!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredChats.map((chat) => {
            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className="w-full bg-white p-3 rounded-2xl border border-gray-100/80 shadow-3xs hover:shadow-2xs hover:border-slate-200 transition-all flex items-center justify-between gap-3 text-left active:scale-[0.99] cursor-pointer group relative"
                id={`chat-item-${chat.id}`}
              >
                {/* Info and Avatar inside a container */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-100 bg-slate-50 flex items-center justify-center">
                      {chat.contactAvatar ? (
                        <img
                          src={chat.contactAvatar}
                          alt={chat.contactName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    {/* Equipment Mini overlay bottom right */}
                    {chat.equipmentImage && (
                      <img
                        src={chat.equipmentImage}
                        alt="equipment icon"
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full object-cover border-2 border-white shadow-2xs bg-white animate-pulse"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>

                  {/* Info Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="font-extrabold text-xs text-gray-850 truncate">
                        {chat.contactName}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold font-mono whitespace-nowrap pl-2">
                        {chat.lastMessageTime}
                      </span>
                    </div>

                    {chat.equipmentTitle && (
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className="text-[9.5px] text-[#1b6d24] font-black truncate">
                          {chat.equipmentTitle}
                        </p>
                        {chat.contactPhone && (
                          <span className="text-[8.5px] text-slate-500 font-bold font-mono shrink-0 flex items-center gap-0.5">
                            <Phone className="w-2 h-2 text-emerald-600" />
                            <span>{chat.contactPhone}</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1 min-w-0">
                      {/* WhatsApp style ticks for last message preview if sent by user */}
                      {chat.messages && chat.messages.length > 0 && chat.messages[chat.messages.length - 1].sender === (isOwnerPerspective ? 'owner' : 'user') && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                      <p className={`text-xs truncate ${chat.unread ? 'font-extrabold text-gray-900' : 'text-gray-400 font-bold'}`}>
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unread dot & Delete button */}
                <div className="flex items-center gap-2 shrink-0 pl-1 z-10">
                  {chat.unread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-green-600 block shrink-0 animate-pulse"></span>
                  )}
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmChatId(chat.id);
                    }}
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer opacity-30 group-hover:opacity-100 focus:outline-none"
                    title={language === 'te' ? 'చాట్‌ను తొలగించండి' : 'Delete Chat'}
                    id={`btn-delete-chat-${chat.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modern custom confirmation modal for deleting chats */}
      {deleteConfirmChatId && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-3xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border border-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-sm font-black text-slate-800">
                {language === 'te' ? 'చాట్‌ను తొలగించాలా?' : 'Delete Conversation?'}
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-bold leading-relaxed text-left">
              {language === 'te' 
                ? 'ఈ సంభాషణ మరియు మెసేజ్ చరిత్ర అంతా శాశ్వతంగా తొలగించబడుతుంది. దీనిని తిరిగి పొందలేరు.' 
                : 'This will permanently delete your chat conversation history. This action cannot be undone.'}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmChatId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 focus:outline-none"
              >
                {language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmChatId) {
                    onDeleteChat(deleteConfirmChatId);
                    if (activeChatId === deleteConfirmChatId) {
                      setActiveChatId(null);
                    }
                    setDeleteConfirmChatId(null);
                  }
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 focus:outline-none"
                id="btn-confirm-delete-chat"
              >
                {language === 'te' ? 'డిలీట్ చేయి' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
