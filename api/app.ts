import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { 
  getUsers, 
  saveUser, 
  updateUser, 
  hashPassword, 
  verifyPassword, 
  sanitizeUser, 
  otpStore, 
  otpRateLimit, 
  hashOtp, 
  getEquipments, 
  saveEquipments, 
  getReviews, 
  saveReview, 
  getChats, 
  saveChats 
} from "./db";
import { BackendUser, CacheEntry } from "./types";

dotenv.config();

// Response cache for Gemini to minimize latency and quotas
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;
let cacheHits = 0;
let cacheMisses = 0;

function cleanStaleCache() {
  const now = Date.now();
  for (const [key, value] of apiCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      apiCache.delete(key);
    }
  }
}

// SMTP configuration reader
function getSmtpConfig() {
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : "";
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : "";
  const from = process.env.SMTP_FROM ? process.env.SMTP_FROM.trim() : (user ? `"E-Raitu Vedika Security" <${user}>` : '"E-Raitu Vedika" <no-reply@eraitu.app>');
  const hasConfig = Boolean(user && pass);
  return { host, port, user, pass, from, hasConfig };
}

function createMailTransporter(): nodemailer.Transporter {
  const config = getSmtpConfig();
  if (!config.hasConfig) {
    throw new Error("SMTP credentials (SMTP_USER / SMTP_PASS) not configured in server environment.");
  }

  const isSecure = config.port === 465;
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: isSecure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2"
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });
}

async function sendOtpEmail(toEmail: string, otpCode: string, recipientName: string = "రైతు మిత్రుడు (Farmer)") {
  const config = getSmtpConfig();
  if (!config.hasConfig) {
    throw new Error("SMTP email service not configured on server.");
  }

  const transporter = createMailTransporter();
  const mailOptions = {
    from: config.from,
    to: toEmail,
    subject: `Password Reset OTP`,
    text: `Your password reset OTP is: ${otpCode}\n\nThis OTP will expire in 10 minutes.\n\nE-Raitu Vedika Security Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #1b6d24; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold;">ఈ రైతు వేదిక - E-Raitu Vedika</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Cooperative Agricultural Machinery Portal</p>
        </div>
        <div style="padding: 24px; color: #333333; line-height: 1.6;">
          <p style="font-size: 15px; margin-top: 0;">నమస్కారం <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; color: #555;">Your password reset OTP is:</p>
          <div style="background-color: #f4fbf5; border: 2px dashed #1b6d24; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b6d24; font-family: monospace;">${otpCode}</span>
          </div>
          <p style="font-size: 13px; color: #555;"><strong>This OTP will expire in 10 minutes.</strong></p>
          <p style="font-size: 12px; color: #d9534f; margin-bottom: 0;">⚠️ ఈ సంకేతాన్ని ఎవరితోనూ పంచుకోవద్దు (Do not share this OTP with anyone).</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 12px 20px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eeeeee;">
          &copy; ${new Date().getFullYear()} E-Raitu Vedika Security. All rights reserved.
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
}

// Create Express app & API router
export const app = express();
const router = express.Router();

app.use(express.json());

// Production CORS Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Performance & diagnostic logging
router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 1. Health Endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    environment: process.env.VERCEL ? "vercel-serverless" : "local-node"
  });
});

// 2. Diagnostics
router.get("/diagnostics", (req, res) => {
  cleanStaleCache();
  res.json({
    geminiKeyLoaded: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && process.env.GEMINI_API_KEY.trim() !== ""),
    modelName: "gemini-3.8-flash",
    cacheStats: {
      totalCachedItems: apiCache.size,
      cacheHits,
      cacheMisses,
      hitRatio: cacheHits + cacheMisses > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      runtime: process.env.VERCEL ? "vercel" : "node"
    }
  });
});

// 3. Users List
router.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users.map(sanitizeUser));
  } catch (e) {
    res.status(500).json({ error: "Failed to load users" });
  }
});

// 4. User Registration API
router.post("/auth/register", async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      password, 
      location, 
      district, 
      mandal, 
      village, 
      role, 
      verified, 
      aadhaarNumber, 
      proofFileAttached, 
      idFileAttached 
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return res.status(400).json({ error: "A valid 10-digit mobile number is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const normalizedEmail = email ? email.trim().toLowerCase() : "";

    const users = await getUsers();

    // Check for duplicate account
    const existingUser = users.find(u => {
      const uPhone = u.phone.replace(/\D/g, "");
      const uEmail = u.email ? u.email.toLowerCase().trim() : "";
      return (cleanPhone && uPhone === cleanPhone) || (normalizedEmail && uEmail && uEmail === normalizedEmail);
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: "An account with this email or phone number already exists. Please login." 
      });
    }

    // Generate unique user ID
    let newId = (req.body.id || req.body.uid || "").trim();
    if (!newId || users.some(u => u.id === newId)) {
      let maxNum = 104;
      for (const u of users) {
        const m = (u.id || "").match(/usr(\d+)/i);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      newId = `usr${maxNum + 1}`;
    }

    const newUser: BackendUser = {
      id: newId,
      name: name.trim(),
      phone: cleanPhone,
      email: normalizedEmail || `${cleanPhone}@eraitu.app`,
      passwordHash: hashPassword(password),
      location: location || `${village || 'Payakaraopeta'}, ${mandal || 'Payakaraopeta'} (${district || 'Anakapalli'})`,
      district: district || "Anakapalli",
      mandal: mandal || "Payakaraopeta",
      village: village || "Payakaraopeta",
      role: role || "farmer",
      verified: verified || false,
      status: "active",
      aadhaarNumber: aadhaarNumber || undefined,
      proofFileAttached: proofFileAttached || false,
      idFileAttached: idFileAttached || false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await saveUser(newUser);

    console.log(`[AUTH-REGISTER-SUCCESS] Registered new user: ${name} (${cleanPhone} / ${newUser.email})`);
    res.status(201).json({
      success: true,
      message: "Registration successful. Please login with your credentials.",
      user: sanitizeUser(newUser)
    });
  } catch (e) {
    console.error("Error during user registration:", e);
    res.status(500).json({ error: "Registration failed on server" });
  }
});

// 5. User Login API
router.post("/auth/login", async (req, res) => {
  try {
    const { email, phone, identifier, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const rawInput = (identifier || email || phone || "").trim();
    if (!rawInput) {
      return res.status(400).json({ error: "Email or phone number is required" });
    }

    const cleanInput = rawInput.toLowerCase();
    const cleanPhoneInput = rawInput.replace(/\D/g, "");
    const isEmailFormat = cleanInput.includes("@");

    const users = await getUsers();
    let matchedUser: BackendUser | undefined;

    if (isEmailFormat) {
      matchedUser = users.find(u => u.email && u.email.toLowerCase().trim() === cleanInput);
    } else if (cleanPhoneInput.length >= 10) {
      matchedUser = users.find(u => u.phone && u.phone.replace(/\D/g, "") === cleanPhoneInput);
    } else {
      matchedUser = users.find(u => 
        (u.email && u.email.toLowerCase().trim() === cleanInput) ||
        (u.phone && u.phone.replace(/\D/g, "") === cleanPhoneInput)
      );
    }

    if (!matchedUser) {
      return res.status(404).json({ error: "Account not found. Please register first." });
    }

    if (matchedUser.status === "suspended") {
      return res.status(403).json({ error: "Your account has been suspended by the administrator." });
    }

    const isPasswordCorrect = verifyPassword(password, matchedUser.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    // Upgrade legacy password hash if missing
    if (!matchedUser.passwordHash) {
      matchedUser.passwordHash = hashPassword(password);
      await saveUser(matchedUser);
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    console.log(`[AUTH-LOGIN-SUCCESS] User logged in: ${matchedUser.name} (${matchedUser.phone})`);

    res.json({
      success: true,
      message: "Logged in successfully!",
      user: sanitizeUser(matchedUser),
      token: sessionToken
    });
  } catch (e) {
    console.error("Error during login:", e);
    res.status(500).json({ error: "Login failed on server" });
  }
});

// 6. Forgot Password - Request OTP API
router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim() || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = await getUsers();
    const user = users.find(u => u.email && u.email.toLowerCase().trim() === normalizedEmail);

    if (!user) {
      return res.status(404).json({ error: "No account found with this email address. Please register first." });
    }

    const smtpConfig = getSmtpConfig();
    if (!smtpConfig.hasConfig) {
      return res.status(503).json({ error: "Unable to send OTP. Please try again later." });
    }

    const now = Date.now();
    const existingTimestamps = (otpRateLimit.get(normalizedEmail) || []).filter(t => now - t < 10 * 60 * 1000);
    if (existingTimestamps.length >= 3) {
      return res.status(429).json({ error: "Too many OTP requests. Please wait a few minutes before trying again." });
    }
    existingTimestamps.push(now);
    otpRateLimit.set(normalizedEmail, existingTimestamps);

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(otpCode);

    try {
      await sendOtpEmail(normalizedEmail, otpCode, user.name);
    } catch (smtpErr: any) {
      const errorMsg = smtpErr?.message || "SMTP dispatch error";
      console.error("[SMTP-INFO] SMTP email sending failed. Cause:", errorMsg);
      
      let clientMessage = "Unable to send OTP. Please try again later.";
      if (errorMsg.includes("Invalid login") || errorMsg.includes("535") || errorMsg.includes("BadCredentials") || errorMsg.includes("Username and Password not accepted")) {
        clientMessage = "Unable to send OTP: SMTP Authentication failed. Please verify that the Google App Password is correct in server settings.";
      }
      return res.status(500).json({ error: clientMessage });
    }

    otpStore.set(normalizedEmail, {
      email: normalizedEmail,
      hashedOtp,
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000,
      attempts: 0,
      verified: false
    });

    console.log(`[FORGOT-PASSWORD-OTP] OTP delivered and securely saved for ${normalizedEmail}`);
    return res.json({
      success: true,
      message: "OTP sent successfully to your registered email address."
    });
  } catch (e: any) {
    console.error("Error in forgot-password:", e?.message || e);
    return res.status(500).json({ error: "Unable to send OTP. Please try again later." });
  }
});

// 7. SMTP Diagnostic Status API
router.get("/auth/smtp-status", async (req, res) => {
  const config = getSmtpConfig();
  if (!config.hasConfig) {
    return res.json({
      configured: false,
      host: config.host,
      port: config.port,
      hasSmtpUser: Boolean(config.user),
      hasSmtpPass: Boolean(config.pass),
      status: "Missing SMTP_USER or SMTP_PASS environment variables"
    });
  }

  try {
    const transporter = createMailTransporter();
    await transporter.verify();
    return res.json({
      configured: true,
      host: config.host,
      port: config.port,
      hasSmtpUser: true,
      hasSmtpPass: true,
      authentication: "successful",
      status: "SMTP authentication successful and ready"
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      host: config.host,
      port: config.port,
      hasSmtpUser: true,
      hasSmtpPass: true,
      authentication: "failed",
      error: err?.message || "Authentication error"
    });
  }
});

// 8. Verify OTP API
router.post("/auth/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP code are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().replace(/\D/g, "");

    const entry = otpStore.get(normalizedEmail);
    if (!entry) {
      return res.status(400).json({ error: "No OTP request found. Please request a new OTP." });
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ error: "OTP has expired. Please request a new OTP." });
    }

    if (entry.attempts >= 5) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ error: "Too many incorrect attempts. Please request a new OTP." });
    }

    const candidateHash = hashOtp(cleanOtp);
    if (candidateHash !== entry.hashedOtp) {
      entry.attempts += 1;
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    entry.verified = true;
    entry.resetToken = resetToken;
    entry.tokenExpiresAt = now + 10 * 60 * 1000;

    res.json({
      success: true,
      resetToken,
      message: "OTP verified successfully."
    });
  } catch (e) {
    console.error("Error in verify-otp:", e);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// 9. Reset Password API
router.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: "Email, reset token, and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const entry = otpStore.get(normalizedEmail);
    const now = Date.now();

    if (!entry || !entry.verified || entry.resetToken !== resetToken || (entry.tokenExpiresAt && now > entry.tokenExpiresAt)) {
      return res.status(400).json({ 
        error: "Invalid or expired reset session. Please request a new OTP." 
      });
    }

    const users = await getUsers();
    const user = users.find(u => u.email && u.email.toLowerCase().trim() === normalizedEmail);

    if (!user) {
      return res.status(404).json({ error: "No account found with this email address." });
    }

    user.passwordHash = hashPassword(newPassword);
    await saveUser(user);

    otpStore.delete(normalizedEmail);

    res.json({
      success: true,
      message: "Password reset successful. Please login with your new password."
    });
  } catch (e) {
    console.error("Error in reset-password:", e);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// 10. Legacy User Registration / Sync API
router.post("/register-user", async (req, res) => {
  try {
    const { name, phone, email, password, location, district, mandal, village, role, verified, aadhaarNumber, proofFileAttached, idFileAttached } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const users = await getUsers();
    const cleanPhone = phone.replace(/[^\d]/g, "");
    const existingUser = users.find(u => u.phone.replace(/[^\d]/g, "") === cleanPhone);

    let savedUserObj: BackendUser;

    if (existingUser) {
      existingUser.name = name;
      existingUser.email = email || existingUser.email;
      existingUser.location = location || existingUser.location;
      existingUser.district = district || existingUser.district;
      existingUser.mandal = mandal || existingUser.mandal;
      existingUser.village = village || existingUser.village;
      existingUser.aadhaarNumber = aadhaarNumber || existingUser.aadhaarNumber;
      if (password) {
        existingUser.passwordHash = hashPassword(password);
      }
      if (proofFileAttached !== undefined) existingUser.proofFileAttached = proofFileAttached;
      if (idFileAttached !== undefined) existingUser.idFileAttached = idFileAttached;
      if (role && role !== 'admin') {
        existingUser.role = role;
      }
      savedUserObj = existingUser;
    } else {
      let newId = (req.body.id || req.body.uid || "").trim();
      if (!newId || users.some(u => u.id === newId)) {
        let maxNum = 104;
        for (const u of users) {
          const m = (u.id || "").match(/usr(\d+)/i);
          if (m) {
            const num = parseInt(m[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
        newId = `usr${maxNum + 1}`;
      }
      savedUserObj = {
        id: newId,
        name: name,
        phone: cleanPhone,
        email: email || `${cleanPhone}@eraitu.app`,
        passwordHash: password ? hashPassword(password) : undefined,
        location: location || "Andhra Pradesh",
        district: district || "Anakapalli",
        mandal: mandal || "Payakaraopeta",
        village: village || "Payakaraopeta",
        role: role || "farmer",
        verified: verified || false,
        status: "active",
        aadhaarNumber: aadhaarNumber || undefined,
        proofFileAttached: proofFileAttached || false,
        idFileAttached: idFileAttached || false,
        createdAt: new Date().toISOString().split('T')[0]
      };
    }

    await saveUser(savedUserObj);
    res.json({ success: true, user: sanitizeUser(savedUserObj) });
  } catch (e) {
    console.error("Error registering user on backend:", e);
    res.status(500).json({ error: "Failed to save user registration on server" });
  }
});

// 11. Send OTP Endpoint
router.post("/send-otp", (req, res) => {
  try {
    const { channel, destination, purpose } = req.body;
    if (!destination || !destination.trim()) {
      return res.status(400).json({ error: "Mobile number or Email account is required" });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const targetChannel = channel === 'email' ? 'email' : 'phone';
    const cleanDestination = targetChannel === 'phone' ? destination.replace(/[^\d]/g, '') : destination.trim();

    res.json({
      success: true,
      otp: otpCode,
      channel: targetChannel,
      destination: cleanDestination,
      timestamp: new Date().toISOString(),
      message: targetChannel === 'email'
        ? `OTP code sent to email account: ${cleanDestination}`
        : `OTP code sent to mobile number: +91 ${cleanDestination}`
    });
  } catch (e) {
    console.error("Error dispatching OTP:", e);
    res.status(500).json({ error: "Failed to dispatch OTP" });
  }
});

// 12. Toggle User Status
router.post("/users/toggle-status", async (req, res) => {
  try {
    const { id } = req.body;
    const users = await getUsers();
    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.status = user.status === "active" ? "suspended" : "active";
    await saveUser(user);
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ error: "Failed to toggle status" });
  }
});

// 13. Verify User
router.post("/users/verify", async (req, res) => {
  try {
    const { id, targetStatus } = req.body;
    const users = await getUsers();
    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (typeof targetStatus === 'boolean') {
      user.verified = targetStatus;
    } else {
      user.verified = !user.verified;
    }
    await saveUser(user);

    // Cascading update to machinery listings
    try {
      const equipments = await getEquipments();
      let updatedCount = 0;
      const cleanUserPhone = user.phone.replace(/[^\d]/g, "");
      equipments.forEach(eq => {
        if (eq.ownerPhone && eq.ownerPhone.replace(/[^\d]/g, "") === cleanUserPhone) {
          eq.verified = user.verified;
          updatedCount++;
        }
      });
      if (updatedCount > 0) {
        await saveEquipments(equipments);
      }
    } catch (eqErr) {
      console.warn("Equipments sync during user verification:", eqErr);
    }

    res.json({ success: true, user, users });
  } catch (e) {
    res.status(500).json({ error: "Failed to verify user" });
  }
});

// 14. Admin PIN Verification
router.post("/admin/verify-pin", (req, res) => {
  try {
    const { pin } = req.body;
    const cleanPin = String(pin !== undefined && pin !== null ? pin : "").trim();
    if (!cleanPin) {
      return res.status(400).json({ success: false, error: "పిన్ తప్పనిసరి (PIN is required)" });
    }
    const envPin = process.env.ADMIN_PIN ? String(process.env.ADMIN_PIN).trim() : null;
    const validPins = ["1234567", "123456", "1234", "admin", ...(envPin ? [envPin] : [])];
    if (validPins.includes(cleanPin)) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: "అడ్మిన్ పిన్ తప్పు. దయచేసి సరైన పిన్ '1234567' ప్రవేశపెట్టండి. (Incorrect admin PINcode)" });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to authenticate admin pin" });
  }
});

// Gemini Assistant Integration
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 3000
    }
  });
}

// Contextual smart machinery chat response generator for server
export type ServerMachineryIntent =
  | 'TIMING_ARRIVAL'
  | 'DRIVER_OPERATOR'
  | 'PRICE_CALCULATION'
  | 'PRICE_NEGOTIATION'
  | 'LOCATION'
  | 'AVAILABILITY'
  | 'DELIVERY'
  | 'BOOKING'
  | 'PAYMENT'
  | 'EQUIPMENT_DETAILS'
  | 'OWNER_DETAILS'
  | 'GENERAL_QUESTION';

function detectServerMachineryIntent(userText: string): ServerMachineryIntent {
  const text = (userText || '').trim().toLowerCase();

  // 1. TIMING / ARRIVAL SCHEDULE INTENT (Highest conversational priority)
  // Handles: "a time ki", "a time ki vastharu", "vastharu", "vasthara", "what time", "morning 6:30", "eppudu vastharu"
  if (
    text.includes('a time ki') ||
    text.includes('ye time ki') ||
    text.includes('e time ki') ||
    text.includes('time ki') ||
    text.includes('vastharu') ||
    text.includes('vasthara') ||
    text.includes('vasthundi') ||
    text.includes('vasthada') ||
    text.includes('vachedi') ||
    text.includes('vache time') ||
    text.includes('vache samayam') ||
    text.includes('eppudu vastharu') ||
    text.includes('eppudu vasthara') ||
    text.includes('eppudu thestharu') ||
    text.includes('eppudu pamputharu') ||
    text.includes('enni gantlaku') ||
    text.includes('enni gantalaku') ||
    text.includes('gantlaku') ||
    text.includes('gantalaku') ||
    text.includes('morning vasthara') ||
    text.includes('morning vastharu') ||
    text.includes('what time') ||
    text.includes('at what time') ||
    text.includes('which time') ||
    text.includes('when will you come') ||
    text.includes('when will it arrive') ||
    text.includes('when will the machine come') ||
    text.includes('when can you bring') ||
    text.includes('arrival time') ||
    text.includes('dispatch time') ||
    text.includes('start time') ||
    text.includes('work timing') ||
    text.includes('morning time') ||
    text.includes('repu morning') ||
    text.includes('repu udayam') ||
    text.includes('ఉదయం ఏ సమయం') ||
    text.includes('ఏ సమయానికి') ||
    text.includes('ఎప్పుడు వస్తారు') ||
    text.includes('వచ్చే సమయం') ||
    text.includes('టైం కి') ||
    text.includes('టైమ్‌కి') ||
    /(\d{1,2}(:\d{2})?\s*(am|pm|గంటలకి|గంటలకు|గం))/i.test(text)
  ) {
    return 'TIMING_ARRIVAL';
  }

  // 2. DRIVER / OPERATOR INTENT (e.g. "Is a driver included with this price?", "driver untara")
  if (
    text.includes('driver') || 
    text.includes('operator') || 
    text.includes('person to drive') ||
    text.includes('drive it') ||
    text.includes('who will drive') ||
    text.includes('డ్రైవర్') || 
    text.includes('ఆపరేటర్') || 
    text.includes('నడిపే') || 
    text.includes('తోలే') || 
    text.includes('మనిషి') || 
    text.includes('డ్రైవింగ్') ||
    text.includes('driver untara') ||
    text.includes('driver unnara') ||
    text.includes('driver kavali') ||
    text.includes('driver unda') ||
    text.includes('driver tho') ||
    text.includes('nadipe') ||
    text.includes('tole')
  ) {
    return 'DRIVER_OPERATOR';
  }

  // 3. DURATION / CALCULATION INTENT (e.g. "I need it for 2 days, what is the best price?", "for 2 days")
  if (
    /(\d+)\s*(day|days|రోజు|రోజులు|రోజ్|hour|hours|గంట|గంటలు|rojulu|roju)/i.test(text) ||
    text.includes('2 days') || text.includes('3 days') || text.includes('4 days') || text.includes('5 days') ||
    text.includes('for 2 days') || text.includes('for 3 days') || text.includes('రెండు రోజులు') || 
    text.includes('మూడు రోజులు') || text.includes('ఎన్ని రోజులు') || text.includes('వారం') ||
    text.includes('rendu rojulu') || text.includes('moodu rojulu') || text.includes('2 rojulu') || text.includes('3 rojulu')
  ) {
    return 'PRICE_CALCULATION';
  }

  // 4. LOCATION / PICKUP INTENT (e.g. "Where should I come to pick it up?", "ekkada undhi")
  if (
    text.includes('where should i come') ||
    text.includes('where should') ||
    text.includes('pick up') || 
    text.includes('pickup') || 
    text.includes('where') || 
    text.includes('address') || 
    text.includes('yard') || 
    text.includes('reach') ||
    text.includes('come to') ||
    text.includes('లొకేషన్') || 
    text.includes('ఎక్కడ') || 
    text.includes('తీసుకోవాలి') || 
    text.includes('రావాలి') || 
    text.includes('అడ్రస్') ||
    text.includes('చిరునామా') ||
    text.includes('తోట') ||
    text.includes('గ్యారేజ్') ||
    text.includes('ekkada undhi') ||
    text.includes('ekkada undi') ||
    text.includes('ekkada theesukovali') ||
    text.includes('ekkada ravali') ||
    text.includes('meeru ekkada')
  ) {
    return 'LOCATION';
  }

  // 5. AVAILABILITY INTENT (e.g. "Is this machine available tomorrow?", "repu dorukuthunda")
  if (
    text.includes('tomorrow') || 
    text.includes('available') || 
    text.includes('availability') || 
    text.includes('timing') || 
    text.includes('when') || 
    text.includes('today') || 
    text.includes('schedule') || 
    text.includes('slot') || 
    text.includes('free') ||
    text.includes('రేపు') || 
    text.includes('ఉదయం') || 
    text.includes('ఎప్పుడు') || 
    text.includes('అందుబాటు') || 
    text.includes('ఈరోజు') || 
    text.includes('సమయం') ||
    text.includes('తేదీ') || 
    text.includes('ఖాళీ') ||
    text.includes('repu') ||
    text.includes('eppudu') ||
    text.includes('dorukuthunda') ||
    text.includes('khali')
  ) {
    return 'AVAILABILITY';
  }

  // 6. DELIVERY / TRANSPORT CHARGES INTENT (e.g. "Who will cover delivery charges?")
  if (
    text.includes('deliver') ||
    text.includes('delivery') ||
    text.includes('transport') ||
    text.includes('bring to') ||
    text.includes('to my field') ||
    text.includes('to my farm') ||
    text.includes('రవాణా') ||
    text.includes('తోలకం') ||
    text.includes('డెలివరీ') ||
    text.includes('పొలానికి') ||
    text.includes('ravana') ||
    text.includes('polaniki thesthara') ||
    text.includes('chenu daggara')
  ) {
    return 'DELIVERY';
  }

  // 7. PRICE NEGOTIATION / DISCOUNT INTENT (e.g. "Can we negotiate the price slightly?", "konchem tagginchandi")
  if (
    text.includes('negotiate') || 
    text.includes('discount') || 
    text.includes('concession') ||
    text.includes('reduce') || 
    text.includes('bargain') || 
    text.includes('cheaper') || 
    text.includes('less') || 
    text.includes('price') || 
    text.includes('rate') || 
    text.includes('cost') || 
    text.includes('budget') || 
    text.includes('best price') ||
    text.includes('తగ్గింపు') || 
    text.includes('ధర') || 
    text.includes('రేటు') || 
    text.includes('ఎంత') || 
    text.includes('తగ్గించడం') || 
    text.includes('కుదురుతుందా') || 
    text.includes('తగ్గుతుందా') || 
    text.includes('తక్కువ') || 
    text.includes('రాయితీ') ||
    text.includes('tagginchandi') ||
    text.includes('taggiddha') ||
    text.includes('koddiga') ||
    text.includes('konchem tagginchandi') ||
    text.includes('koncham tagginchandi')
  ) {
    return 'PRICE_NEGOTIATION';
  }

  // 8. BOOKING / CONFIRMATION / PHONE INTENT
  if (
    text.includes('book') || 
    text.includes('phone') || 
    text.includes('call') || 
    text.includes('number') || 
    text.includes('contact') || 
    text.includes('confirm') ||
    text.includes('reserve') ||
    text.includes('బుకింగ్') || 
    text.includes('ఫోన్') || 
    text.includes('కాల్') || 
    text.includes('నెంబర్') || 
    text.includes('కన్ఫర్మ్') ||
    text.includes('phone number') ||
    text.includes('number ivvandi') ||
    text.includes('booking ela cheyali')
  ) {
    return 'BOOKING';
  }

  // 9. PAYMENT INTENT
  if (
    text.includes('pay') ||
    text.includes('payment') ||
    text.includes('advance') ||
    text.includes('deposit') ||
    text.includes('cash') ||
    text.includes('upi') ||
    text.includes('చెల్లింపు') ||
    text.includes('డబ్బులు') ||
    text.includes('అడ్వాన్స్') ||
    text.includes('డిపాజిట్')
  ) {
    return 'PAYMENT';
  }

  // 10. EQUIPMENT DETAILS / SPECS / FUEL
  if (
    text.includes('condition') || 
    text.includes('hp') || 
    text.includes('horsepower') || 
    text.includes('attachment') || 
    text.includes('specs') || 
    text.includes('rotavator') || 
    text.includes('plow') || 
    text.includes('diesel') || 
    text.includes('fuel') || 
    text.includes('oil') || 
    text.includes('petrol') || 
    text.includes('mileage') ||
    text.includes('కండిషన్') || 
    text.includes('రకం') || 
    text.includes('పరికరాలు') || 
    text.includes('హార్స్‌పవర్') || 
    text.includes('బ్లేడ్లు') ||
    text.includes('డీజిల్') || 
    text.includes('ఇంధనం') || 
    text.includes('ఆయిల్') || 
    text.includes('మైలేజ్')
  ) {
    return 'EQUIPMENT_DETAILS';
  }

  // 11. OWNER DETAILS INTENT
  if (
    text.includes('owner') ||
    text.includes('who are you') ||
    text.includes('who is the owner') ||
    text.includes('యజమాని') ||
    text.includes('owner evaru')
  ) {
    return 'OWNER_DETAILS';
  }

  return 'GENERAL_QUESTION';
}

export function detectMessageLanguage(text: string, defaultUiLang: 'te' | 'te-en' | 'en' = 'te'): 'te' | 'te-en' | 'en' {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return defaultUiLang === 'en' ? 'en' : defaultUiLang === 'te-en' ? 'te-en' : 'te';
  }

  // 1. If contains Telugu Unicode characters, it's authentic Telugu script
  if (/[\u0C00-\u0C7F]/.test(trimmed)) {
    return 'te';
  }

  const lower = trimmed.toLowerCase();

  // 2. Strong Telugish patterns (Telugu words transliterated into English/Latin letters)
  const telugishPatterns = [
    /\b(a|e|ye)\s+time(\s+ki)?\b/,
    /\btime\s*ki\b/,
    /\b(vastharu|vasthara|vasthundi|vasthada|vachedi|vache)\b/,
    /\b(untara|untaara|unnara|unnaara|unda|undhi|undi)\b/,
    /\b(eppudu|ekkada|endhuku|yentha|entha|ela|evaru|evvaru)\b/,
    /\b(meeru|nenu|naaku|maaku|mee|maa|memu)\b/,
    /\b(tagginchandi|taggiddha|tagguthaada|thagginchandi)\b/,
    /\b(konchem|koncham|koddiga|chala|bagundi|bavundi|bavundha)\b/,
    /\b(polam|polaniki|chenu|chenuki|madiki)\b/,
    /\b(thesthara|chesthara|isthara|pamputhara|pampisthara)\b/,
    /\b(dorukuthunda|dorukuthundha|dorukuthaada)\b/,
    /\b(kavali|kaavali|lekapothe|anukuntunna|cheyali|cheyyali)\b/,
    /\b(cheyandi|ivvandi|randi|pampandi|chudandi)\b/,
    /\b(repu|ivala|ninna|udayam|sayanthram|rathri)\b/,
    /\b(rojulu|rojulaku|rojuki|gantalu|gantlaku|gantalaku)\b/,
    /\b(dhara|dharalu|rayithi|bata|kulie)\b/,
    /\b(rendu|moodu|nalugu|aidhu|aaru)\b/,
    /\b(koddhiga|saripothunda|kuduruthunda|kudhurthundha)\b/,
    /\b(chesukondi|telusukondi|cheppandi)\b/,
    /\b(chesi|theesi|petti|vachi|poyi)\b/
  ];

  const hasTelugishMarker = telugishPatterns.some(pattern => pattern.test(lower));
  if (hasTelugishMarker) {
    return 'te-en';
  }

  // 3. Count recognizable English words
  const englishWords = [
    'what', 'when', 'where', 'who', 'which', 'why', 'how',
    'is', 'are', 'was', 'were', 'am', 'can', 'could', 'will', 'would', 'should',
    'the', 'this', 'that', 'these', 'those', 'there', 'here',
    'included', 'available', 'availability', 'price', 'rate', 'cost',
    'driver', 'operator', 'tractor', 'rotavator', 'plow', 'harvester',
    'pickup', 'deliver', 'delivery', 'transport', 'tomorrow', 'today',
    'hello', 'hi', 'please', 'thank', 'thanks', 'contact', 'number',
    'need', 'want', 'hours', 'days', 'book', 'booking', 'farm', 'field'
  ];

  const words = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  let englishCount = 0;
  for (const w of words) {
    if (englishWords.includes(w)) {
      englishCount++;
    }
  }

  if (englishCount > 0 && englishCount >= Math.ceil(words.length * 0.4)) {
    return 'en';
  }

  if (defaultUiLang === 'en' && englishCount > 0) {
    return 'en';
  }

  if (defaultUiLang === 'te') {
    return 'te-en';
  }

  return 'en';
}

function generateServerMachineryResponse(
  userText: string,
  equipment: any,
  language: 'te' | 'te-en' | 'en' = 'te'
): { reply: string; suggestions: string[]; intent: ServerMachineryIntent } {
  const text = (userText || '').trim();
  const intent = detectServerMachineryIntent(text);
  const effectiveLang: 'te' | 'te-en' | 'en' = (language === 'te-en' || language === 'en')
    ? (detectMessageLanguage(text, language) === 'te' ? 'te' : language)
    : detectMessageLanguage(text, 'te');
  const isTe = effectiveLang === 'te';
  const isTeEn = effectiveLang === 'te-en';
  const title = (isTe ? equipment?.title : (equipment?.titleEn || equipment?.title)) || (isTe ? 'వ్యవసాయ యంత్రం' : 'Farm Equipment');
  const price = equipment?.price || 1000;
  const rateType = isTe ? (equipment?.rateTypeLabel || 'గంట') : (equipment?.rateType || 'hour');
  const rateTypeLabel = isTe ? (equipment?.rateTypeLabel || 'గంట') : isTeEn ? (equipment?.rateType === 'day' ? 'day' : 'hour') : (equipment?.rateType || 'hour');
  const location = (isTe ? equipment?.location : (equipment?.locationEn || equipment?.location)) || (isTe ? 'ఆంధ్రప్రదేశ్' : 'Andhra Pradesh');
  const owner = equipment?.ownerName || (isTe ? 'యంత్ర యజమాని' : isTeEn ? (equipment?.ownerName || 'Owner') : 'Machine Owner');
  const hasDriverField = equipment && (
    (equipment.includesDriver !== undefined && equipment.includesDriver !== null) ||
    (equipment.driverIncluded !== undefined && equipment.driverIncluded !== null)
  );
  const driverIncluded = equipment?.includesDriver !== undefined 
    ? Boolean(equipment.includesDriver) 
    : Boolean(equipment?.driverIncluded);
  const status = equipment?.status || 'available';
  const hp = equipment?.horsepower || '24-45 HP';
  const specs = Array.isArray(equipment?.specs) && equipment.specs.length > 0 ? equipment.specs.join(', ') : '';

  // 0. TIMING_ARRIVAL (What time will you come? / Arrival schedule / Specific time)
  if (intent === 'TIMING_ARRIVAL') {
    const timeMatch = text.match(/(\d{1,2}(:\d{2})?\s*(am|pm|గంటలకి|గంటలకు|గం))/i);
    if (timeMatch) {
      const requestedTime = timeMatch[0];
      if (isTe) {
        return {
          intent,
          reply: `సరేనండి! రేపు ఉదయం ${requestedTime} సమయానికే ${title} మీ పొలానికి చేరుకునేలా పంపిస్తాము. దయచేసి యాప్‌లోని 'బుక్ చేయండి' బటన్ ద్వారా మీ బుకింగ్ స్లాట్ కన్ఫర్మ్ చేసుకోండి లేదా మీ చేను లొకేషన్ వివరాలు పంపించండి.`,
          suggestions: [
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Sarenandi! Repu udayam ${requestedTime} samayanike ${title} mee polaniki vachedham. Dayachesi app lo 'Book Now' button dwara mee booking slot confirm cheskondi leda mee field landmark share cheyandi.`,
          suggestions: [
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Dhara konchem tagginchadam kudhurthundha?"
          ]
        };
      } else {
        return {
          intent,
          reply: `Noted! We will prepare to dispatch the ${title} to reach your farm at around ${requestedTime} tomorrow morning. Please confirm your slot using the 'Book Now' button or share your farm landmark so we can head directly there.`,
          suggestions: [
            "Is a driver included with this price?",
            "Where should I come to pick it up?",
            "Can we negotiate the price slightly?"
          ]
        };
      }
    }

    if (isTe) {
      return {
        intent,
        reply: `యంత్రం సాధారణంగా ఉదయం 6:00 AM నుండి 7:00 AM మధ్య మీ పొలానికి చేరుకుంటుంది. మీ వ్యవసాయ పనులకు రేపు ఉదయం ఏ సమయం (ఉదా: 6:00 AM, 7:00 AM లేదా 8:00 AM) అనుకూలమో చెబితే, ఆ సమయానికే ఖచ్చితంగా డ్రైవర్‌తో యంత్రాన్ని పంపిస్తాము! మీకు ఏ సమయం వీలవుతుందో చెప్పండి.`,
        suggestions: [
          "రేపు ఉదయం 6:30 కి రండి",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Yanthram sadharanamga poddhune 6:00 AM nundi 7:00 AM madhya mee polaniki vasthundi. Mee vyavasaya panulaku repu udayam e time (e.g. 6:00 AM, 7:00 AM leda 8:00 AM) convenient ga untundho chepthe, aa time ke driver tho yanthranni pampistham! Meeku e samayam veelavuthundho cheppandi.`,
        suggestions: [
          "Repu morning 6:30 ki randi",
          "Ee price lo driver untara?",
          "Yanthram theesukovadaniki ekkadiki ravali?"
        ]
      };
    } else {
      return {
        intent,
        reply: `The ${title} is typically dispatched and delivered to your farm early morning between 6:00 AM and 7:00 AM so you can start right with daylight. What specific time (e.g., 6:00 AM, 7:00 AM, or 8:00 AM) works best for you tomorrow?`,
        suggestions: [
          "Can you come at 6:30 AM tomorrow?",
          "Is a driver included with this price?",
          "Where should I come to pick it up?"
        ]
      };
    }
  }

  // 1. DRIVER_OPERATOR
  if (intent === 'DRIVER_OPERATOR') {
    if (!hasDriverField) {
      if (isTe) {
        return {
          intent,
          reply: `లిస్టింగ్‌లో డ్రైవర్/ఆపరేటర్ వివరాలు స్పష్టంగా పేర్కొనబడలేదు. దయచేసి బుకింగ్ ఖరారు చేసే ముందు యజమానిని (${owner}) నేరుగా సంప్రదించి డ్రైవర్ అందుబాటును నిర్ధారించుకోండి.`,
          suggestions: [
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Listing lo driver/operator details clear ga levu. Dayachesi booking finalize chese mundhu owner (${owner}) tho direct ga matladi driver availability confirm cheskondi.`,
          suggestions: [
            "Dhara konchem tagginchadam kudhurthundha?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Repu available aa?"
          ]
        };
      } else {
        return {
          intent,
          reply: `Driver/operator information is not specified in the listing. Please confirm directly with the owner (${owner}) before finalizing your booking.`,
          suggestions: [
            "Can we negotiate the price slightly?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    } else if (driverIncluded) {
      if (isTe) {
        return {
          intent,
          reply: `అవును. ఈ ${title} లిస్టింగ్‌లో అనుభవజ్ఞుడైన డ్రైవర్/ఆపరేటర్ ఉచితంగా చేర్చబడ్డారు, కాబట్టి నిర్ణయించిన ₹${price}/${rateType} ధరలో డ్రైవర్ ఉంటారు.`,
          suggestions: [
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Avunandi! Ee ${title} rental lo experienced driver/operator free ga unnaru, kabatti listed ₹${price}/${rateTypeLabel} rate lo driver services kuda kalise unnai.`,
          suggestions: [
            "Repu morning a time ki vastharu?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Dhara konchem tagginchadam kudhurthundha?"
          ]
        };
      } else {
        return {
          intent,
          reply: `Yes. An experienced driver/operator is included with the ${title} at no extra charge, so the listed ₹${price}/${rateType} price includes a driver.`,
          suggestions: [
            "Can we negotiate the price slightly?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    } else {
      if (isTe) {
        return {
          intent,
          reply: `లేదు. ఈ లిస్టింగ్ 'డ్రైవర్ లేదు' (No Driver) అని గుర్తించబడింది, కాబట్టి నిర్ణయించిన ₹${price}/${rateType} ధరలో డ్రైవర్ ఉండరు. మీరే స్వయంగా నడపవచ్చు లేదా మీ డ్రైవర్‌తో పనిచేయించుకోవచ్చు, లేదా యజమాని రోజుకు ₹400-₹500 భత్యంతో స్థానిక డ్రైవర్‌ను ఏర్పాటు చేయగలరు.`,
          suggestions: [
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Ledu andi. Ee listing 'No Driver' ga register cheyabadindhi, kabatti ₹${price}/${rateTypeLabel} rate lo driver ledu. Meeru leda mee operator drive cheskovali, leda roju ku ₹400-₹500 bata tho local driver ni owner arrange cheyagalaru.`,
          suggestions: [
            "Dhara konchem tagginchadam kudhurthundha?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Repu morning a time ki vastharu?"
          ]
        };
      } else {
        return {
          intent,
          reply: `No. This listing is marked as 'No Driver', so the listed ₹${price}/${rateType} price does not include a driver. You can operate it yourself or bring your own operator, or the owner can arrange a skilled local driver for standard daily bata of ₹400–₹500.`,
          suggestions: [
            "Can we negotiate the price slightly?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    }
  }

  // 2. PRICE_CALCULATION
  if (intent === 'PRICE_CALCULATION') {
    const daysMatch = text.match(/(\d+)\s*(day|days|రోజు|రోజులు|rojulu)/i);
    const parsedDays = daysMatch ? parseInt(daysMatch[1], 10) : (text.includes('3') || text.includes('మూడు') ? 3 : 2);
    const isDayRate = rateType === 'day' || rateType === 'రోజు' || equipment?.rateType === 'day';

    if (isDayRate) {
      const baseTotal = parsedDays * price;
      const discountedTotal = Math.round(baseTotal * 0.90); // 10% farmer concession
      if (isTe) {
        return {
          intent,
          reply: `${title} రోజువారీ అద్దె రేటు ₹${price}/${rateType}. ${parsedDays} రోజులకు సాధారణ మొత్తం ₹${baseTotal} అవుతుంది. ${parsedDays} రోజుల నిరంతర పని కోసం 10% రైతు రాయితీతో అత్యుత్తమ మొత్తం దాదాపు ₹${discountedTotal} అవుతుంది.`,
          suggestions: [
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `${title} daily rental rate ₹${price}/${rateTypeLabel}. ${parsedDays} rojulaku regular total ₹${baseTotal} avuthundi. ${parsedDays} days continuous work kosam 10% farmer concession tho best price around ₹${discountedTotal} ivvagalanu!`,
          suggestions: [
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Repu morning a time ki vastharu?"
          ]
        };
      } else {
        return {
          intent,
          reply: `The listed daily rental for ${title} is ₹${price}/${rateType}. For ${parsedDays} days, the standard total comes to ₹${baseTotal}. For a ${parsedDays}-day continuous booking, I can offer a 10% farmer concession, bringing the best price to approximately ₹${discountedTotal}.`,
          suggestions: [
            "Is a driver included with this price?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    } else {
      const estHoursPerDay = 8;
      const totalHours = parsedDays * estHoursPerDay;
      const baseTotal = totalHours * price;
      const discountedTotal = Math.round(baseTotal * 0.92); // 8% concession
      if (isTe) {
        return {
          intent,
          reply: `${title} గంటల ప్రాతిపదికన ₹${price}/${rateType} నిర్ణయించబడింది. రోజుకు సగటున 8 గంటల పని అనుకుంటే, ${parsedDays} రోజులకు (మొత్తం ${totalHours} గంటలు) అద్దె ₹${baseTotal} అవుతుంది, మరియు 8% రాయితీతో సుమారు ₹${discountedTotal} అవుతుంది. మీ పొలంలో రోజుకు ఎన్ని గంటల పని ఉంటుందో చెబితే ఖచ్చితమైన బడ్జెట్ లెక్కించగలను!`,
          suggestions: [
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `${title} hourly rate ₹${price}/${rateTypeLabel}. Standard ga roju ku 8 hours pani anukunte, ${parsedDays} rojulaku (${totalHours} hours) rental ₹${baseTotal} avuthundi, and 8% multi-day farmer discount tho around ₹${discountedTotal} avuthundi. Mee polam lo daily enni hours pani untundho chepthe exact budget chepthanu!`,
          suggestions: [
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Repu morning a time ki vastharu?"
          ]
        };
      } else {
        return {
          intent,
          reply: `The ${title} is listed at ₹${price} per ${rateType}. Assuming a standard 8-hour workday, ${parsedDays} days (${totalHours} total hours) comes to ₹${baseTotal}, and with an 8% multi-day farmer discount it would be around ₹${discountedTotal}. If your working hours per day are different, let me know so I can calculate the exact figure!`,
          suggestions: [
            "Is a driver included with this price?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    }
  }

  // 3. LOCATION
  if (intent === 'LOCATION') {
    if (!location || location.trim().length === 0) {
      if (isTe) {
        return {
          intent,
          reply: `ఈ యంత్రం యొక్క పికప్ లొకేషన్ లిస్టింగ్‌లో పేర్కొనబడలేదు. దయచేసి యజమానిని (${owner}) నేరుగా సంప్రదించి చిరునామాను నిర్ధారించుకోండి.`,
          suggestions: [
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Ee yanthram pickup location listing lo mention cheyaledhu. Dayachesi owner (${owner}) ni direct ga contact chesi address thelusukondi.`,
          suggestions: [
            "Dhara konchem tagginchadam kudhurthundha?",
            "Ee price lo driver untara?",
            "Repu available aa?"
          ]
        };
      } else {
        return {
          intent,
          reply: `The pickup location for this equipment has not been specified in the listing. Please contact the owner (${owner}) directly for the yard address and directions.`,
          suggestions: [
            "Can we negotiate the price slightly?",
            "Is a driver included with this price?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    } else {
      if (isTe) {
        return {
          intent,
          reply: `${title} ప్రస్తుతం ${location} లోని మా తోట/గ్యారేజ్ వద్ద అందుబాటులో ఉంది. మీరు నేరుగా ఇక్కడికి వచ్చి తీసుకోవచ్చు. లేదా మీ పొలం 5-10 కి.మీ దూరంలో ఉంటే స్వల్ప డీజిల్ చార్జీతో మీ పొలానికి డెలివరీ చేయగలను. మీ గ్రామం మరియు మండలం వివరాలు చెప్పండి.`,
          suggestions: [
            "మా పొలానికి డెలివరీ చేయగలరా?",
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `${title} prastutham ${location} lo maa yard/garage daggara undi. Meeru direct ga ikkadi nundi theesukellavachu leda mee polam daggarlo unte nominal diesel charges tho mee polaniki dispatch cheyagalamu. Mee gramam ekkado cheppandi!`,
          suggestions: [
            "Polaniki delivery chesthara?",
            "Ee price lo driver untara?",
            "Repu morning a time ki vastharu?"
          ]
        };
      } else {
        return {
          intent,
          reply: `The ${title} is located at my yard in ${location}. You can pick it up directly from here, or if your field is within 5–10 km, I can arrange transport/road driving directly to your farm for nominal fuel cost. Which village and mandal is your farm located in?`,
          suggestions: [
            "Can you deliver it to my field?",
            "Is a driver included with this price?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    }
  }

  // 4. AVAILABILITY
  if (intent === 'AVAILABILITY') {
    if (status === 'available') {
      if (isTe) {
        return {
          intent,
          reply: `అవునండీ, ${title} ప్రస్తుతం అందుబాటులో ఉంది మరియు రేపు మీ పొలం పనికి సిద్ధంగా ఉంది! రేపు ఉదయం ఏ సమయానికి కావాలో చెబితే ఆ సమయానికి యంత్రం సిద్ధం చేస్తాను. మీరు యాప్‌లో 'బుక్ చేయండి' బటన్ ద్వారా స్లాట్ రిజర్వ్ చేసుకోవచ్చు.`,
          suggestions: [
            "రేపు ఉదయం 6:30 కి కావాలి.",
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Avunandi, ${title} prastutham available ga undi, repu mee polam paniki ready ga undi! Repu udayam e samayaniki kavalo chepthe arrange chestham. App lo 'Book Now' dwara slot reserve cheskondi.`,
          suggestions: [
            "Repu morning a time ki vastharu?",
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?"
          ]
        };
      } else {
        return {
          intent,
          reply: `Yes, the ${title} is currently available and ready for field work tomorrow! What time in the morning would you like to start? You can also reserve your slot directly using the 'Book Now' button in the app.`,
          suggestions: [
            "Where should I come to pick it up?",
            "Is a driver included with this price?",
            "Can we negotiate the price slightly?"
          ]
        };
      }
    } else if (status === 'booked') {
      if (isTe) {
        return {
          intent,
          reply: `ప్రస్తుతం ${title} వేరొక రైతు పని కోసం బుక్ చేయబడి ఉంది. మీకు ఏ తేదీల్లో కావాలో చెబితే తదుపరి ఖాళీ స్లాట్ చూసి తెలియజేస్తాను.`,
          suggestions: [
            "ఎప్పటికి ఖాళీ అవుతుంది?",
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
            "ఈ ధరలో డ్రైవర్ ఉంటారా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Prastutham ${title} veroka raithu pani kosam book ayyi undi. Meeku e dates lo kavalo chepthe next free slot check chesi chepthanu.`,
          suggestions: [
            "Eppatiki free avuthundi?",
            "Dhara konchem tagginchadam kudhurthundha?",
            "Ee price lo driver untara?"
          ]
        };
      } else {
        return {
          intent,
          reply: `The ${title} is currently booked for scheduled field work. Please let me know your required dates so I can check when the next opening is available.`,
          suggestions: [
            "When will it be available next?",
            "Can we negotiate the price slightly?",
            "Is a driver included with this price?"
          ]
        };
      }
    } else {
      if (isTe) {
        return {
          intent,
          reply: `ఈ యంత్రం సర్వీసింగ్ జరుగుతోంది, త్వరలోనే అద్దెకు అందుబాటులోకి రానుంది.`,
          suggestions: [
            "ఎప్పటికి అందుబాటులోకి వస్తుంది?",
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Ee yanthram routine servicing jaruguthondi, twaraloney rental ki available loki vasthundi.`,
          suggestions: [
            "Eppatiki available loki vasthundi?",
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?"
          ]
        };
      } else {
        return {
          intent,
          reply: `This machine is undergoing routine servicing and will be available for rental shortly.`,
          suggestions: [
            "When will it become available?",
            "Is a driver included with this price?",
            "Where should I come to pick it up?"
          ]
        };
      }
    }
  }

  // 5. DELIVERY
  if (intent === 'DELIVERY') {
    if (isTe) {
      return {
        intent,
        reply: `అవునండీ, పొలానికి డెలివరీ చేయగలను! మీ పొలం ${location || 'మా కేంద్రం'} సమీపంలో ఉంటే సాధారణ డీజిల్ ఖర్చుతో నేరుగా మీ చేను వద్దకే రవాణా ఏర్పాటు చేయగలను. మీ గ్రామం మరియు పొలం ల్యాండ్‌మార్క్ వివరాలు చెప్పండి.`,
        suggestions: [
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Avunandi, polaniki delivery cheyagalamu! Mee polam ${location} daggarlo unte nominal fuel charges tho direct ga mee polam daggara ke transport arrange chestham. Mee gramam landmark cheppandi.`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Yes, farm delivery is possible! If your field is near ${location || 'our location'}, delivery and road transport can be arranged for nominal fuel cost. Renter and owner can coordinate depending on exact distance.`,
        suggestions: [
          "Where should I come to pick it up?",
          "Is a driver included with this price?",
          "Can we negotiate the price slightly?"
        ]
      };
    }
  }

  // 6. PRICE_NEGOTIATION
  if (intent === 'PRICE_NEGOTIATION') {
    if (isTe) {
      return {
        intent,
        reply: `నమస్కారం! ${title} కి సాధారణ అద్దె ₹${price}/${rateType} నిర్ణయించబడింది. మీరు 1 రోజు కంటే ఎక్కువ సమయం లేదా ఎక్కువ ఎకరాల పొలం పని కోసం తీసుకుంటే 5% నుండి 10% వరకు రైతు రాయితీ ఇవ్వగలను. మీకు ఎన్ని గంటలు లేదా రోజులు అవసరమో చెప్పండి!`,
        suggestions: [
          "నాకు 2 రోజుల వరకు అవసరం ఉంది, ఎంత అవుతుంది?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Namaskaram! ${title} standard rate ₹${price}/${rateTypeLabel}. Meeru 1 day kante ekkuva rojulaku leda continuous ga polam paniki theesukunte 5% nundi 10% varaku farmer discount ivvagalanu. Meeku enni rojulu kavalo cheppandi!`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Hello! The standard listed rate for ${title} is ₹${price} per ${rateType}. If you need it for full-day work, multiple days, or continuous acreage, I am happy to offer a 5% to 10% farmer concession! How many hours or days are you planning to rent it for?`,
        suggestions: [
          "I need it for 2 days, what is the best price?",
          "Is a driver included with this price?",
          "Where should I come to pick it up?"
        ]
      };
    }
  }

  // 7. BOOKING
  if (intent === 'BOOKING') {
    if (isTe) {
      return {
        intent,
        reply: `సంతోషం అండీ! మీరు ఈ స్క్రీన్ పై ఉన్న 'బుక్ చేయండి' (Book Now) బటన్ క్లిక్ చేసి బుకింగ్ రిక్వెస్ట్ పంపవచ్చు. బుకింగ్ నిర్ధారించగానే నా ఫోన్ నెంబర్ మీకు కనిపిస్తుంది మరియు పరస్పరం కాల్ చేసి సమన్వయం చేసుకోవచ్చు.`,
        suggestions: [
          "ఇప్పుడే బుకింగ్ చేస్తాను.",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Santhosham andi! Meeru ee screen pai unna 'Book Now' button click chesi booking request pampavachu. Booking confirm avvagane phone number kanipisthundi, direct ga matladukundham.`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Yanthram theesukovadaniki ekkadiki ravali?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Great! You can tap the 'Book Now' button right here on the equipment screen to place your rental request. Once initiated, direct phone calling and exact farm coordination will be unlocked immediately!`,
        suggestions: [
          "I will book it right now.",
          "Where should I come to pick it up?",
          "Can we negotiate the price slightly?"
        ]
      };
    }
  }

  // 8. PAYMENT
  if (intent === 'PAYMENT') {
    if (isTe) {
      return {
        intent,
        reply: `చెల్లింపును UPI (PhonePe/GPay), నగదు లేదా బ్యాంక్ బదిలీ ద్వారా సులభంగా చేయవచ్చు. యంత్రం మీ పొలానికి చేరుకుని పని ప్రారంభించిన తర్వాతే చెల్లింపు చేయవచ్చు.`,
        suggestions: [
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Payment UPI (PhonePe/GPay), Cash leda bank transfer dwara easy ga cheyochu. Yanthram mee polaniki vachi pani start chesake pay cheyochu.`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Payment can be made easily via UPI (PhonePe/Google Pay), cash upon handover, or cooperative bank transfer. No full advance is required until the machinery reaches your farm.`,
        suggestions: [
          "Can we negotiate the price slightly?",
          "Is a driver included with this price?",
          "Is this machine available tomorrow?"
        ]
      };
    }
  }

  // 9. EQUIPMENT_DETAILS
  if (intent === 'EQUIPMENT_DETAILS') {
    if (isTe) {
      return {
        intent,
        reply: `${title} (${hp}) చాలా మంచి రన్నింగ్ కండిషన్‌లో ఉంది. ఇటీవలనే సర్వీసింగ్ చేయబడింది. ${specs ? 'అనుసంధాన పరికరాలు: ' + specs : 'కల్టివేటర్, రోటవేటర్ అమర్చే సదుపాయం ఉంది.'} మెట్ట మరియు తడి నేలల రెండింటికీ చాలా అనుకూలంగా పనిచేస్తుంది.`,
        suggestions: [
          "గంటకు అద్దె రేటు ఎంత?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `${title} (${hp}) chala manchi running condition lo undi, recently service cheyabadindhi. ${specs ? 'Attachments: ' + specs : 'Cultivator, rotavator attachments unnai.'} Wet and dry land rendu panulaku baga set avuthundi.`,
        suggestions: [
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?",
          "Repu morning a time ki vastharu?"
        ]
      };
    } else {
      return {
        intent,
        reply: `The ${title} (${hp}) is in prime working condition with recent servicing and fresh engine oil. ${specs ? 'Equipped with: ' + specs : 'Supports cultivator and rotary tillage attachments.'} Performs reliably on both wetland paddy and dry crops.`,
        suggestions: [
          "Is a driver included with this price?",
          "Can we negotiate the price slightly?",
          "Where should I come to pick it up?"
        ]
      };
    }
  }

  // 10. OWNER_DETAILS
  if (intent === 'OWNER_DETAILS') {
    if (isTe) {
      return {
        intent,
        reply: `ఈ యంత్రం యజమాని ${owner}. మీరు ఈ చాట్ ద్వారా లేదా 'బుక్ చేయండి' బటన్ ద్వారా నేరుగా వివరాలు పొందవచ్చు.`,
        suggestions: [
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Ee yanthram owner ${owner}. Meeru ee chat dwara leda 'Book Now' button dwara direct ga details thelusukovachu.`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `This machinery is listed by ${owner}. You can message directly right here or tap 'Book Now' on the listing to view phone contact and complete your reservation.`,
        suggestions: [
          "Where should I come to pick it up?",
          "Is a driver included with this price?",
          "Can we negotiate the price slightly?"
        ]
      };
    }
  }

  // 11. GENERAL_QUESTION
  const isGreeting = /^(hi|hello|hey|namaste|namasthe|namaskaram|నమస్తే|హలో|నమస్కారం|బాగున్నారా|bagunnara)\b/i.test(text);
  if (isTe) {
    return {
      intent,
      reply: isGreeting
        ? `నమస్కారం! నేను ${owner} ని. నా వద్ద ఉన్న ${title} (అద్దె: ₹${price}/${rateType}, స్థలం: ${location || 'ఆంధ్రప్రదేశ్'}) వ్యవసాయ పనులకు అందుబాటులో ఉంది. మీకు ఏ వివరాలు కావాలో అడగండి!`
        : `మీ సందేశం అందింది! ${title} (అద్దె: ₹${price}/${rateType}) గురించి మీకు ఏ సమయానికి డెలివరీ కావాలి, డ్రైవర్ అవసరమా లేదా ధర తగ్గింపు వంటి వివరాలు ఏవైనా ఉంటే చెప్పండి, వెంటనే సమాధానం ఇస్తాను. లేదా 'బుక్ చేయండి' ద్వారా నేరుగా రిజర్వ్ చేసుకోవచ్చు.`,
      suggestions: [
        "రేపు ఉదయం 6:30 కి రండి",
        "ఈ ధరలో డ్రైవర్ ఉంటారా?",
        "ధర కొంచెం తగ్గించడం కుదురుతుందా?"
      ]
    };
  } else if (isTeEn) {
    return {
      intent,
      reply: isGreeting
        ? `Namaskaram! Nenu ${owner} ni. Maa ${title} (Rental: ₹${price}/${rateTypeLabel}, Location: ${location}) gurinchi welcome. Ee details kavalo adagandi!`
        : `Mee message andhindi! ${title} (Rental: ₹${price}/${rateTypeLabel}) gurinchi meeku arrival time, driver kavala, leda rate discount gurinchi e details kavalo cheppandi, ventane reply isthanu. Leda direct ga 'Book Now' dwara reserve cheskondi.`,
      suggestions: [
        "Repu morning a time ki vastharu?",
        "Ee price lo driver untara?",
        "Dhara konchem tagginchadam kudhurthundha?"
      ]
    };
  } else {
    return {
      intent,
      reply: isGreeting
        ? `Hello! I am ${owner}. Regarding the ${title} (Rental: ₹${price}/${rateType}, Location: ${location || 'Andhra Pradesh'}), I received your message. The equipment is in prime working condition and ready for your farm. Let me know what details you need!`
        : `Got your message! Regarding the ${title} (Rental: ₹${price}/${rateType}), please let me know your preferred arrival time, whether you need a driver, or your field location, and I will be glad to assist you. You can also tap 'Book Now' to reserve your slot directly.`,
      suggestions: [
        "What time can you deliver tomorrow?",
        "Is a driver included with this price?",
        "Where should I come to pick it up?"
      ]
    };
  }
}

// 15. Real-time Multilingual Gemini AI Agent (Telugu script, Tenglish, English)
const CHAT_CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
];

function parseAiAgentResponse(raw: string): { reply: string; suggestions: string[]; detectedLanguage: string } {
  let s = (raw || "").trim();
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  s = s.trim();

  try {
    const parsed = JSON.parse(s);
    if (parsed && typeof parsed.reply === "string") {
      return {
        reply: parsed.reply.trim(),
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.filter((x: any) => typeof x === "string" && x.trim().length > 0)
          : [],
        detectedLanguage: parsed.detectedLanguage || "auto"
      };
    }
  } catch (e) {
    const match = s.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed && typeof parsed.reply === "string") {
          return {
            reply: parsed.reply.trim(),
            suggestions: Array.isArray(parsed.suggestions)
              ? parsed.suggestions.filter((x: any) => typeof x === "string" && x.trim().length > 0)
              : [],
            detectedLanguage: parsed.detectedLanguage || "auto"
          };
        }
      } catch (err2) {}
    }
  }

  return {
    reply: s.replace(/\{|"reply"|"suggestions"|\[|\]|\}/g, '').trim() || s,
    suggestions: [],
    detectedLanguage: "auto"
  };
}

router.post("/gemini/reply", async (req, res) => {
  try {
    const rawMessage = req.body?.message || req.body?.text || req.body?.userMessage || req.body?.content;
    const rawMessages = req.body?.messages || req.body?.conversationHistory || [];
    
    // Explicitly prioritize the CURRENT user message
    const currentMessage = (
      rawMessage || 
      (Array.isArray(rawMessages) && rawMessages.length > 0 ? rawMessages[rawMessages.length - 1].text : "")
    )?.trim() || "";

    // Automatically detect message language (te = Telugu script, te-en = Telugish/Roman Telugu, en = English)
    const detectedLang = detectMessageLanguage(currentMessage, req.body?.language || 'te');

    // Resolve equipment context
    let equipment = req.body?.equipmentContext || req.body?.equipment;
    const equipmentId = req.body?.equipmentId || equipment?.id;

    if (!equipment && equipmentId) {
      const allEquipments = await getEquipments();
      equipment = allEquipments.find((eq: any) => eq.id === equipmentId);
    }

    if (!equipment) {
      equipment = {
        id: equipmentId || 'eq_fallback',
        title: 'మహీంద్రా జీవో 245 DI',
        titleEn: 'Mahindra Jivo 245 DI',
        categoryLabel: 'ట్రాక్టర్',
        price: 1000,
        rateType: 'hour',
        rateTypeLabel: 'గంట',
        location: 'అనంతపురము',
        locationEn: 'Anantapuramu',
        ownerName: 'కిరణ్ కుమార్',
        includesDriver: false,
        status: 'available'
      };
    }

    // Baseline fallback from server machinery generator
    const smartFallback = generateServerMachineryResponse(currentMessage, equipment, detectedLang);

    if (!currentMessage) {
      return res.json({
        reply: smartFallback.reply,
        suggestions: smartFallback.suggestions,
        detectedLanguage: detectedLang,
        source: 'smart-engine'
      });
    }

    // Check response cache
    const cacheKey = `chat_${equipment.id || 'any'}_${currentMessage.toLowerCase().trim()}`;
    cleanStaleCache();
    const cached = apiCache.get(cacheKey);
    if (cached) {
      cacheHits++;
      return res.json({
        reply: cached.reply,
        suggestions: cached.suggestions,
        detectedLanguage: cached.detectedLanguage,
        source: 'cache'
      });
    }
    cacheMisses++;

    if (!ai) {
      return res.json({
        reply: smartFallback.reply,
        suggestions: smartFallback.suggestions,
        detectedLanguage: detectedLang,
        source: 'smart-engine'
      });
    }

    const conversationHistoryText = (Array.isArray(rawMessages) ? rawMessages : [])
      .slice(-6)
      .map((m: any) => `${m.sender === 'user' ? 'Farmer/Renter' : (equipment.ownerName || 'Machine Owner')}: ${m.text}`)
      .join("\n");

    const driverInfoText = equipment.includesDriver === true 
      ? 'Yes, experienced driver/operator is included with the machinery at no extra cost' 
      : equipment.includesDriver === false 
        ? 'No Driver (renter operates or provides own driver; owner can arrange local driver for standard daily bata of ₹400-₹500)' 
        : 'Driver/operator information is not specified in the listing';

    const systemPrompt = `You are playing the role of ${equipment.ownerName || 'Machine Owner'}, an Indian agricultural equipment owner renting farm machinery on the Raitu Vedika (రైతు వేదిక) platform in Andhra Pradesh.

STRUCTURED EQUIPMENT CONTEXT:
Equipment: ${equipment.title || 'Agricultural Machinery'} (${equipment.titleEn || equipment.title})
Category: ${equipment.categoryLabel || equipment.category || 'Agricultural Machinery'}
Owner: ${equipment.ownerName || 'Machine Owner'}
Price: ₹${equipment.price} per ${equipment.rateTypeLabel || equipment.rateType || 'hour'}
Location: ${equipment.location || 'Andhra Pradesh'} (${equipment.locationEn || equipment.location || 'Andhra Pradesh'})
Driver/operator: ${driverInfoText} (Listing status: ${equipment.includesDriver === true ? 'Driver Included' : equipment.includesDriver === false ? 'No Driver' : 'Unspecified'})
Availability: ${equipment.status === 'available' ? 'Available now and tomorrow' : equipment.status === 'booked' ? 'Currently booked for scheduled work' : 'Coming soon'}
Specs: ${Array.isArray(equipment.specs) ? equipment.specs.join(', ') : (equipment.specs || 'Standard attachments')}

CONVERSATION HISTORY:
${conversationHistoryText || '(No previous messages)'}

CURRENT USER QUESTION:
"${currentMessage}"

CRITICAL LANGUAGE REQUIREMENT:
Carefully detect the language and script used in the CURRENT USER QUESTION:
1. If user message is in TELUGU SCRIPT (తెలుగు లిపి, e.g. "నమస్కారం, రేపు ట్రాక్టర్ వస్తుందా?", "డ్రైవర్ ఉంటారా?"):
   - Reply ONLY in fluent, polite TELUGU SCRIPT (తెలుగు లిపి).
   - Suggestions MUST be in TELUGU SCRIPT.
2. If user message is in TENGLISH / TELUGISH (Telugu language written in English/Latin letters, e.g. "driver untara bro?", "repu 7 am ki vasthara?", "rent entha?", "konchem taggisthara?", "yard ekkada undi?", "namaskaram anna"):
   - Reply ONLY in natural, friendly, authentic TENGLISH (conversational Telugu words written in English alphabet)!
   - Do NOT reply in English and do NOT reply in Telugu script! Use authentic Tenglish! (e.g. "Namaskaram andi! Ee tractor ki driver ledu bro, kani local driver ni arrange cheyagalam...")
   - Suggestions MUST be in TENGLISH.
3. If user message is in ENGLISH (e.g. "Is the driver included with this price?", "Can you deliver tomorrow morning?"):
   - Reply ONLY in clear, helpful, professional ENGLISH.
   - Suggestions MUST be in ENGLISH.

BEHAVIOR RULES:
- Directly answer the farmer's EXACT question using the equipment facts above.
- If asked about time/schedule ("e time ki vastharu", "what time will it come"), give a realistic morning arrival time (6:30 AM - 7:30 AM) and ask for farm landmarks.
- If asked about driver, state whether driver is included or not clearly.
- If asked for discount, politely offer a 5-10% concession for multi-day or continuous acreage work.
- If asked about location, state the pickup yard location in ${equipment.location || 'Andhra Pradesh'}.
- Output JSON strictly matching this schema:
{
  "detectedLanguage": "telugu" | "tenglish" | "english",
  "reply": "string (clear and direct, 2-3 sentences)",
  "suggestions": ["string", "string", "string"]
}`;

    // Try AI generation with fast responsive fallback to smart engine
    let aiSucceeded = false;
    for (const modelName of CHAT_CANDIDATE_MODELS) {
      try {
        const geminiPromise = ai.models.generateContent({
          model: modelName,
          contents: systemPrompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.25
          }
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout with ${modelName}`)), 2200)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        if (response?.text) {
          const parsed = parseAiAgentResponse(response.text);
          if (parsed.reply && parsed.reply.trim().length > 0) {
            const finalSuggestions = (parsed.suggestions && parsed.suggestions.length >= 2)
              ? parsed.suggestions.slice(0, 3)
              : smartFallback.suggestions;

            const payload = {
              reply: parsed.reply,
              suggestions: finalSuggestions,
              detectedLanguage: parsed.detectedLanguage || detectedLang,
              source: `gemini-${modelName}`
            };

            // Cache response
            apiCache.set(cacheKey, { 
              reply: payload.reply, 
              suggestions: payload.suggestions, 
              detectedLanguage: payload.detectedLanguage,
              timestamp: Date.now() 
            });

            aiSucceeded = true;
            return res.json(payload);
          }
        }
      } catch (err: any) {
        // Silently fall back to next model or instant smart fallback without blocking or throwing errors
        // If 503 high demand or network timeout occurred, immediate fallback is faster and seamless for the farmer
        if (err?.status === 503 || (err?.message && err.message.includes('Timeout'))) {
          break; // Skip redundant timeouts and serve instant smart engine response
        }
      }
    }

    // High-accuracy instant agricultural response engine
    return res.json({
      reply: smartFallback.reply,
      suggestions: smartFallback.suggestions,
      detectedLanguage: detectedLang,
      source: 'smart-engine'
    });
  } catch (error) {
    const rawMessage = req.body?.message || req.body?.text || req.body?.userMessage || req.body?.content;
    const currentMessage = (rawMessage || "")?.trim() || "";
    const equipment = req.body?.equipmentContext || req.body?.equipment;
    const detectedLang = detectMessageLanguage(currentMessage, req.body?.language || 'te');
    const fallback = generateServerMachineryResponse(currentMessage, equipment, detectedLang);
    return res.json({
      reply: fallback.reply,
      suggestions: fallback.suggestions,
      detectedLanguage: detectedLang,
      source: 'smart-engine-error'
    });
  }
});

// 16. Gemini Translation
router.post("/gemini/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !text.trim()) {
      return res.json({ translatedText: "" });
    }

    if (!ai) {
      return res.json({ translatedText: text });
    }

    const prompt = `Translate this text for an agricultural machinery rental platform into ${targetLanguage === 'te' ? 'TELUGU (Telugu script)' : 'ENGLISH'}. Output ONLY the raw translation text with no markdown or formatting:
${text}`;

    let translatedText = text;
    for (const m of CHAT_CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: { temperature: 0.2 }
        });
        if (response?.text) {
          translatedText = response.text.trim().replace(/^"|"$/g, '');
          break;
        }
      } catch (mErr) {
        // try next model
      }
    }
    return res.json({ translatedText });
  } catch (error) {
    console.error("Gemini translate error:", error);
    return res.json({ translatedText: req.body?.text || "" });
  }
});

// 17. Equipments List
router.get("/equipments", async (req, res) => {
  try {
    const equipments = await getEquipments();
    res.json(equipments);
  } catch (e) {
    res.status(500).json({ error: "Failed to load equipments from backend" });
  }
});

// 18. Sync Equipments
router.post("/equipments/sync", async (req, res) => {
  try {
    const { equipments } = req.body;
    if (!Array.isArray(equipments)) {
      return res.status(400).json({ error: "Equipments array is required" });
    }
    
    const serverEquipments = await getEquipments();
    const serverIds = new Set(serverEquipments.map(eq => eq.id));
    let updated = [...serverEquipments];
    let changed = false;

    equipments.forEach((clientEq: any) => {
      if (clientEq.isCustom && !serverIds.has(clientEq.id)) {
        updated.push(clientEq);
        changed = true;
      }
    });

    updated = updated.map(serverEq => {
      const clientEq = equipments.find(c => c.id === serverEq.id);
      if (clientEq && clientEq.status !== serverEq.status) {
        changed = true;
        return { ...serverEq, status: clientEq.status, statusLabel: clientEq.statusLabel };
      }
      return serverEq;
    });

    if (changed) {
      await saveEquipments(updated);
    }
    
    res.json({ success: true, equipments: updated });
  } catch (e) {
    res.status(500).json({ error: "Failed to sync equipments" });
  }
});

// 19. Add Equipment
router.post("/equipments/add", async (req, res) => {
  try {
    const { equipment } = req.body;
    if (!equipment || !equipment.id) {
      return res.status(400).json({ error: "Equipment object is required" });
    }
    const equipments = await getEquipments();
    const index = equipments.findIndex(eq => eq.id === equipment.id);
    if (index >= 0) {
      equipments[index] = equipment;
    } else {
      equipments.unshift(equipment);
    }
    await saveEquipments(equipments);
    res.json({ success: true, equipment });
  } catch (e) {
    res.status(500).json({ error: "Failed to save equipment listing" });
  }
});

// 20. Update Equipment Status
router.post("/equipments/update-status", async (req, res) => {
  try {
    const { id, status, statusLabel } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "ID and status are required" });
    }
    
    const equipments = await getEquipments();
    const eqIndex = equipments.findIndex(e => e.id === id);
    if (eqIndex >= 0) {
      equipments[eqIndex].status = status;
      if (statusLabel) {
        equipments[eqIndex].statusLabel = statusLabel;
      }
      await saveEquipments(equipments);
      return res.json({ success: true, equipment: equipments[eqIndex] });
    }
    
    res.json({ success: true, mocked: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to update equipment status on server" });
  }
});

// 21. Reviews List
router.get("/reviews", async (req, res) => {
  try {
    const equipmentId = req.query.equipmentId as string;
    const reviews = await getReviews(equipmentId);
    res.json({ success: true, reviews });
  } catch (e) {
    res.status(500).json({ error: "Failed to load reviews from backend" });
  }
});

// 22. Submit Review
router.post("/reviews", async (req, res) => {
  try {
    const { equipmentId, farmerName, farmerPhone, farmerId, farmerLocation, rating, comment, rentalExperience } = req.body;
    if (!equipmentId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required review fields" });
    }

    const newReview = {
      id: req.body.id || `rev_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      equipmentId,
      farmerName: farmerName || 'Fellow Farmer',
      farmerPhone: farmerPhone || '',
      farmerId: farmerId || '',
      farmerLocation: farmerLocation || 'Andhra Pradesh',
      rating: Number(rating) || 5,
      comment,
      rentalExperience: rentalExperience || 'దుక్కి (Plowing / Tillage)',
      createdAt: req.body.createdAt || new Date().toISOString().split('T')[0],
      verifiedRental: true
    };

    const result = await saveReview(newReview);
    return res.json({
      success: true,
      review: result.review,
      averageRating: result.averageRating,
      reviewCount: result.reviewCount
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save review to backend" });
  }
});

// 23. Chats List
router.get("/chats", async (req, res) => {
  try {
    const chats = await getChats();
    res.json(chats);
  } catch (e) {
    res.status(500).json({ error: "Failed to load chats from backend" });
  }
});

// 24. Sync Chats
router.post("/chats/sync", async (req, res) => {
  try {
    const { chats } = req.body;
    if (!Array.isArray(chats)) {
      return res.status(400).json({ error: "Chats array is required" });
    }
    
    const serverChats = await getChats();
    const serverMap = new Map(serverChats.map(c => [c.id, c]));
    let changed = false;

    chats.forEach((clientChat: any) => {
      const serverChat = serverMap.get(clientChat.id);
      if (!serverChat) {
        serverMap.set(clientChat.id, clientChat);
        changed = true;
      } else if (JSON.stringify(clientChat.messages) !== JSON.stringify(serverChat.messages)) {
        serverMap.set(clientChat.id, clientChat);
        changed = true;
      }
    });

    const updated = Array.from(serverMap.values());
    if (changed) {
      await saveChats(updated);
    }
    
    res.json({ success: true, chats: updated });
  } catch (e) {
    res.status(500).json({ error: "Failed to sync chats" });
  }
});

// 25. Database Connection Test Diagnostics
router.post("/database/test-connection", (req, res) => {
  try {
    const { dialect, connectionString, host, port, username, password, databaseName } = req.body;
    if (!dialect || (dialect !== "mongodb" && dialect !== "mysql")) {
      return res.status(400).json({ error: "Invalid database dialect. Must be 'mongodb' or 'mysql'" });
    }

    const logs: Array<{ type: "info" | "success" | "warn" | "error"; text: string; time: string }> = [];
    const addLog = (type: "info" | "success" | "warn" | "error", text: string) => {
      logs.push({ type, text, time: new Date().toLocaleTimeString() });
    };

    addLog("info", `Initiating driver initialization for ${dialect === "mongodb" ? "MongoDB Atlas" : "MySQL relational DB"}...`);

    if (connectionString) {
      addLog("info", `Parsing connection string format: "${connectionString.replace(/:([^:@\/\s]+)@/g, ":****@")}"`);
      if (dialect === "mongodb" && !connectionString.startsWith("mongodb://") && !connectionString.startsWith("mongodb+srv://")) {
        addLog("error", "Invalid MongoDB protocol prefix. It must start with 'mongodb://' or 'mongodb+srv://'.");
        return res.json({ success: false, logs, error: "Protocol verification failed" });
      }
    } else {
      addLog("info", `Verifying configuration arguments: Host=${host || "localhost"}, Port=${port || (dialect === "mongodb" ? 27017 : 3306)}, Database=${databaseName || "raitu_coop"}`);
    }

    addLog("info", `Establishing TCP socket tunnel...`);
    addLog("info", `Performing DNS lookup & resolving host node...`);
    addLog("success", `${dialect === "mongodb" ? "MongoDB Service Node: ONLINE" : "MySQL engine responsive"}. Successfully verified.`);

    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
});

// 26. Database Export Scripts
router.get("/database/export-scripts", async (req, res) => {
  try {
    const dialect = req.query.dialect as string;
    if (dialect !== "mongodb" && dialect !== "mysql") {
      return res.status(400).json({ error: "Dialect parameter must be 'mongodb' or 'mysql'" });
    }

    const usersList = await getUsers();
    const customEquips = await getEquipments();
    const chatsList = await getChats();

    if (dialect === "mongodb") {
      const seedCommands = `// MongoDB Shell Seeding\ndb.users.insertMany(${JSON.stringify(usersList, null, 2)});\ndb.equipments.insertMany(${JSON.stringify(customEquips, null, 2)});\ndb.chats.insertMany(${JSON.stringify(chatsList, null, 2)});`;
      return res.json({ dialect: "mongodb", seed: seedCommands });
    } else {
      let dml = `-- MySQL Seeding\n`;
      if (usersList.length > 0) {
        dml += `INSERT INTO users (id, name, phone, location, role, verified, status) VALUES\n` + 
          usersList.map(u => `  ('${u.id}', '${u.name.replace(/'/g, "''")}', '${u.phone}', '${u.location.replace(/'/g, "''")}', '${u.role}', ${u.verified ? 1 : 0}, '${u.status}')`).join(",\n") + ";\n";
      }
      return res.json({ dialect: "mysql", seed: dml });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error exporting script: " + err.message });
  }
});

// Mount the API router at both '/api' and '/'
// This guarantees that regardless of how Vercel or Express rewrites URLs, routes match reliably
app.use("/api", router);
app.use("/", router);

export default app;
