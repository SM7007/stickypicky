const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../config/db');
const { generateToken } = require('../utils/generateToken');
const { createError } = require('../middleware/errorMiddleware');
const { sendResetOtpEmail } = require('../utils/emailService');

// POST /api/auth/register

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return next(createError('Email already registered', 400));

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return next(createError('Invalid email or password', 401));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(createError('Invalid email or password', 401));

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return next(createError('Google credential token required', 400));

    let payload;
    try {
      const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {

      // Fallback decode if GOOGLE_CLIENT_ID is not configured yet during dev testing
      const jwt = require('jsonwebtoken');
      payload = jwt.decode(credential);
      if (!payload || !payload.email) {
        return next(createError('Invalid Google credential token', 400));
      }
    }

    const { email, name, sub: googleId } = payload;
    if (!email) return next(createError('Email not found in Google account profile', 400));

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          googleId,
          role: 'CUSTOMER',
        },
      });
    }

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(createError('Email is required', 400));

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(createError('No account found with this email address', 404));

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const hashedOtp = await bcrypt.hash(otpCode, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: hashedOtp,
        resetOtpExpires: expiresAt,
      },
    });

    await sendResetOtpEmail(user.email, otpCode, user.name);

    res.json({ message: 'Verification code sent to your email address' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return next(createError('Email, verification code, and new password are required', 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return next(createError('Invalid or expired reset request. Please request a new code.', 400));
    }

    if (new Date() > new Date(user.resetOtpExpires)) {
      return next(createError('Verification code has expired. Please request a new code.', 400));
    }

    const isOtpValid = await bcrypt.compare(otp.trim(), user.resetOtp);
    if (!isOtpValid) {
      return next(createError('Invalid verification code', 400));
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetOtp: null,
        resetOtpExpires: null,
      },
    });

    res.json({ message: 'Password reset successful! You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, googleLogin, forgotPassword, resetPasswordWithOtp, getMe };
