import { Equipment, Chat, ChatMessage, FarmerProfile } from './types';

export interface BookingChatParams {
  equipment: Equipment;
  farmer: FarmerProfile;
  duration: number;
  rateType?: 'day' | 'hour';
  deliveryLocation: string;
  totalCost: number;
  language: 'te' | 'en';
  customNote?: string;
}

/**
 * Generates the official Farmer-to-Owner booking message containing:
 * - Equipment Details & Owner Detail Number
 * - Farmer Name & Farmer Contact Phone Number
 * - Delivery Place / Village
 * - Rental Duration & Total Cost
 */
export function generateFarmerBookingMessage(params: BookingChatParams): string {
  const { equipment, farmer, duration, rateType = equipment.rateType || 'day', deliveryLocation, totalCost, language, customNote } = params;
  const isTe = language === 'te';
  const eqTitle = isTe ? equipment.title : (equipment.titleEn || equipment.title);
  const durUnit = rateType === 'day' ? (isTe ? 'రోజులు' : 'Days') : (isTe ? 'గంటలు' : 'Hours');

  if (isTe) {
    return `🚜 నూతన యంత్ర బుకింగ్ నిర్ధారణ (New Booking Order)
నమస్కారం ${equipment.ownerName} గారు,
రైతు వేదిక యాప్ ద్వారా మీ "${eqTitle}" వ్యవసాయ యంత్రాన్ని నేను బుక్ చేసుకున్నాను.

📋 బుకింగ్ మరియు యజమాని వివరాలు:
• యంత్రం: ${eqTitle}
• యజమాని పేరు: ${equipment.ownerName}
• యజమాని సంప్రదింపు నంబర్: 📞 ${equipment.ownerPhone}

👨‍🌾 బుక్ చేసిన రైతు వివరాలు:
• రైతు పేరు: ${farmer.name}
• రైతు మొబైల్ నంబర్: 📱 ${farmer.phone}
• డెలివరీ ప్రాంతం/గ్రామం: 📍 ${deliveryLocation || farmer.location || 'ఆంధ్రప్రదేశ్ క్షేత్రం'}
• అద్దె వ్యవధి: ⏱️ ${duration} ${durUnit}
• మొత్తం అద్దె చెల్లింపు: 💰 ₹${totalCost}

${customNote ? `📝 రైతు అభ్యర్థన: "${customNote}"\n` : ''}దయచేసి యంత్ర రవాణా మరియు డ్రైవర్ సమన్వయాన్ని ధృవీకరించగలరు. ధన్యవాదాలు! 🌾`;
  }

  return `🚜 Equipment Booking Confirmation (కొత్త బుకింగ్)
Hello ${equipment.ownerName},
I have successfully booked your "${eqTitle}" on E-Raitu Vedika cooperative platform.

📋 Booking & Machinery Owner Details:
• Equipment: ${eqTitle}
• Owner Name: ${equipment.ownerName}
• Owner Contact No: 📞 ${equipment.ownerPhone}

👨‍🌾 Farmer Contact Details:
• Farmer Name: ${farmer.name}
• Farmer Mobile No: 📱 ${farmer.phone}
• Delivery Location: 📍 ${deliveryLocation || farmer.location || 'AP Agricultural Field'}
• Rental Duration: ⏱️ ${duration} ${durUnit}
• Total Rent Amount: 💰 ₹${totalCost}

${customNote ? `📝 Note: "${customNote}"\n` : ''}Please confirm the machinery dispatch schedule and operator arrival. Thank you! 🌾`;
}

/**
 * Generates the Owner-to-Farmer confirmation response message:
 * - Acknowledges the booking order
 * - Acknowledges the farmer's contact phone number
 * - Confirms readiness of machinery & operator dispatch
 * - Provides owner's contact phone number for direct coordination
 * - Delivered in Telugu or English
 */
export function generateOwnerBookingResponse(params: BookingChatParams): string {
  const { equipment, farmer, deliveryLocation, language } = params;
  const isTe = language === 'te';
  const eqTitle = isTe ? equipment.title : (equipment.titleEn || equipment.title);
  const loc = deliveryLocation || farmer.location || (isTe ? 'మీ పొలం' : 'your fields');

  if (isTe) {
    return `నమస్కారం ${farmer.name} గారు! 🙏🌾
మీ "${eqTitle}" బుకింగ్ ఆర్డర్ విజయవంతంగా నమోదైంది. మీ వివరాలు మరియు ఫోన్ నంబర్ (${farmer.phone}) నోట్ చేసుకున్నాను.

✅ మా యంత్రం పూర్తి సర్వీసింగ్, డీజిల్ చెకింగ్ మరియు అనుభవజ్ఞుడైన ఆపరేటర్‌తో రవాణాకు సిద్ధంగా ఉంది.
📍 మీరు పేర్కొన్న ప్రాంతానికి (${loc}) ఖచ్చితమైన సమయానికి చేరుకుంటుంది.

రవాణా రూట్ లేదా తదుపరి వివరాల కోసం నన్ను ఎప్పుడైనా 📞 ${equipment.ownerPhone} లో నేరుగా సంప్రదించవచ్చు. రైతు వేదిక ద్వారా మమ్మల్ని ఎంచుకున్నందుకు ధన్యవాదాలు! 🚜🌾`;
  }

  return `Hello ${farmer.name} ji! 🙏🌾
Thank you for booking our "${eqTitle}". I have received your booking details and recorded your contact number (${farmer.phone}).

✅ The machinery is fully inspected, fueled, and ready with an experienced operator for dispatch.
📍 It will reach your scheduled location (${loc}) on time.

For transit coordination or route details, feel free to call me anytime at 📞 ${equipment.ownerPhone}. Thank you for booking through Raitu Vedika! 🚜🌾`;
}

/**
 * Creates or updates a Chat thread with both the Farmer's booking message and the Owner's response.
 */
export function processBookingChat(
  currentChats: Chat[],
  params: BookingChatParams
): { updatedChats: Chat[]; targetChatId: string } {
  const { equipment, farmer, language } = params;
  const isTe = language === 'te';
  const eqTitle = isTe ? equipment.title : (equipment.titleEn || equipment.title);

  const farmerMsgText = generateFarmerBookingMessage(params);
  const ownerReplyText = generateOwnerBookingResponse(params);

  const existingIdx = currentChats.findIndex(
    c => c.equipmentId === equipment.id || c.contactPhone === equipment.ownerPhone
  );

  const now = Date.now();
  const msgFarmerId = `m_bk_f_${now}_${Math.random().toString(36).substring(2, 6)}`;
  const msgOwnerId = `m_bk_o_${now + 500}_${Math.random().toString(36).substring(2, 6)}`;

  const farmerMsg: ChatMessage = {
    id: msgFarmerId,
    sender: 'user',
    text: farmerMsgText,
    time: isTe ? 'ఇప్పుడే' : 'Just Now'
  };

  const ownerReply: ChatMessage = {
    id: msgOwnerId,
    sender: 'owner',
    text: ownerReplyText,
    time: isTe ? 'ఇప్పుడే' : 'Just Now'
  };

  let updatedChats = [...currentChats];
  let targetChatId = '';

  if (existingIdx >= 0) {
    const existing = currentChats[existingIdx];
    targetChatId = existing.id;
    const updatedChat: Chat = {
      ...existing,
      equipmentId: equipment.id,
      equipmentTitle: eqTitle,
      equipmentImage: equipment.imageUrl || existing.equipmentImage,
      contactName: equipment.ownerName,
      contactPhone: equipment.ownerPhone,
      ownerPhone: equipment.ownerPhone,
      senderPhone: farmer.phone,
      senderName: farmer.name,
      senderAvatar: farmer.avatar,
      farmerUid: farmer.uid || farmer.id,
      lastMessage: ownerReplyText,
      lastMessageTime: isTe ? 'ఇప్పుడే' : 'Just Now',
      unread: true,
      messages: [...existing.messages, farmerMsg, ownerReply]
    };
    updatedChats.splice(existingIdx, 1);
    updatedChats.unshift(updatedChat);
  } else {
    targetChatId = `chat_bk_${equipment.id}_${now}`;
    const newChat: Chat = {
      id: targetChatId,
      equipmentId: equipment.id,
      equipmentTitle: eqTitle,
      equipmentImage: equipment.imageUrl,
      contactName: equipment.ownerName,
      contactAvatar: equipment.ownerAvatar || 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&q=80',
      contactPhone: equipment.ownerPhone,
      ownerPhone: equipment.ownerPhone,
      senderPhone: farmer.phone,
      senderName: farmer.name,
      senderAvatar: farmer.avatar,
      farmerUid: farmer.uid || farmer.id,
      lastMessage: ownerReplyText,
      lastMessageTime: isTe ? 'ఇప్పుడే' : 'Just Now',
      unread: true,
      messages: [farmerMsg, ownerReply]
    };
    updatedChats.unshift(newChat);
  }

  return { updatedChats, targetChatId };
}

/**
 * Ensures that every equipment in user's bookedEquipmentIds has an active chat thread with the owner
 * containing the booking message and owner response.
 */
export function ensureBookedEquipmentChatsExist(
  bookedIds: string[],
  equipmentList: Equipment[],
  currentChats: Chat[],
  farmer: FarmerProfile,
  language: 'te' | 'en'
): Chat[] {
  if (!bookedIds || bookedIds.length === 0 || !farmer) return currentChats;

  let resultChats = [...currentChats];
  let changed = false;

  for (const bId of bookedIds) {
    const eq = equipmentList.find(e => e.id === bId);
    if (!eq) continue;

    // Check if a chat already exists for this equipment or owner for this farmer
    const hasChat = resultChats.some(
      c => (c.equipmentId === eq.id || c.contactPhone === eq.ownerPhone) &&
           (c.senderPhone === farmer.phone || c.farmerUid === farmer.uid || !c.senderPhone)
    );

    if (!hasChat) {
      // Retrieve saved booking details if any
      let duration = eq.rateType === 'day' ? 3 : 5;
      try {
        const savedDurations = localStorage.getItem('rv_booking_durations');
        if (savedDurations) {
          const parsed = JSON.parse(savedDurations);
          if (parsed[eq.id]) duration = Number(parsed[eq.id]) || duration;
        }
      } catch (e) {}

      let deliveryLocation = farmer.location || 'అనకాపల్లి (Anakapalli)';
      try {
        const savedLocs = localStorage.getItem('rv_booking_locations');
        if (savedLocs) {
          const parsed = JSON.parse(savedLocs);
          if (parsed[eq.id]) deliveryLocation = parsed[eq.id];
        }
      } catch (e) {}

      const totalCost = (Number(eq.price) || 1200) * duration;

      const { updatedChats } = processBookingChat(resultChats, {
        equipment: eq,
        farmer,
        duration,
        rateType: eq.rateType || 'day',
        deliveryLocation,
        totalCost,
        language
      });

      resultChats = updatedChats;
      changed = true;
    }
  }

  return changed ? resultChats : currentChats;
}
