const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateOTP = require("../utils/otp");
const sendOTPEmail = require("../utils/sendEmail");

const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_WINDOW_MS = 60 * 60 * 1000;
const MAX_OTP_REQUESTS = 5;

const prepareOTPRequest = (user) => {
	const now = Date.now();
	const windowStart = user.otpRequestWindowStart?.getTime();
	user.otpRequestCount = user.otpRequestCount || 0;

	if (!windowStart || now - windowStart >= OTP_WINDOW_MS) {
		user.otpRequestWindowStart = new Date(now);
		user.otpRequestCount = 0;
	}

	if (
		user.otpSentAt &&
		now - user.otpSentAt.getTime() < OTP_COOLDOWN_MS
	) {
		return {
			allowed: false,
			message: "Please wait 60 seconds before requesting another OTP.",
		};
	}

	if (user.otpRequestCount >= MAX_OTP_REQUESTS) {
		return {
			allowed: false,
			message: "OTP request limit reached. Please try again later.",
		};
	}

	const otp = generateOTP();
	user.otp = otp;
	user.otpExpiry = new Date(now + 5 * 60 * 1000);
	user.otpSentAt = new Date(now);
	user.otpRequestCount += 1;

	return { allowed: true, otp };
};

const register = async (req, res) => {
	try {
		const { name, phone, email, password, confirmPassword } = req.body;

		// Check required fields
		if (!name || !phone || !email || !password || !confirmPassword) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		// Validate phone
		if (!/^[0-9]{10}$/.test(phone)) {
			return res.status(400).json({
				success: false,
				message: "Phone number must contain exactly 10 digits",
			});
		}

		// Validate email
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return res.status(400).json({
				success: false,
				message: "Please enter a valid email address",
			});
		}

		// Validate password
		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 6 characters",
			});
		}

		// Confirm password
		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message: "Passwords do not match",
			});
		}

		// Check existing email
		const existingEmail = await User.findOne({
			email: email.toLowerCase(),
		});

		if (existingEmail) {
			return res.status(409).json({
				success: false,
				message: "An account with this email already exists",
			});
		}

		// Check existing phone
		const existingPhone = await User.findOne({
			phone,
		});

		if (existingPhone) {
			return res.status(409).json({
				success: false,
				message: "An account with this phone number already exists",
			});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Generate OTP
		const otp = generateOTP();

		// OTP expires in 5 minutes
		const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

		// Create user
		const user = await User.create({
			name: name.trim(),
			phone,
			email: email.toLowerCase().trim(),
			password: hashedPassword,
			isVerified: false,
			otp,
			otpExpiry,
			otpSentAt: new Date(),
			otpRequestCount: 1,
			otpRequestWindowStart: new Date(),
		});

		await sendOTPEmail(user.email, otp);

		res.status(201).json({
			success: true,
			message: "Registration successful. Please verify your email.",
			userId: user._id,
		});
	} catch (error) {
		console.error("Registration error:", error);

		res.status(500).json({
			success: false,
			message: "Something went wrong during registration",
		});
	}
};

const verifyOTP = async (req, res) => {
	try {
		const { email, otp } = req.body;

		if (!email || !otp) {
			return res.status(400).json({
				success: false,
				message: "Email and OTP are required",
			});
		}

		const user = await User.findOne({
			email: email.toLowerCase().trim(),
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		if (user.isVerified) {
			return res.status(400).json({
				success: false,
				message: "Email is already verified",
			});
		}

		if (!user.otp || !user.otpExpiry) {
			return res.status(400).json({
				success: false,
				message: "OTP not found. Please request a new OTP",
			});
		}

		if (new Date() > user.otpExpiry) {
			return res.status(400).json({
				success: false,
				message: "OTP has expired. Please request a new OTP",
			});
		}

		if (user.otp !== otp) {
			return res.status(400).json({
				success: false,
				message: "Invalid OTP",
			});
		}

		user.isVerified = true;
		user.otp = null;
		user.otpExpiry = null;

		await user.save();

		const token = jwt.sign(
			{
				userId: user._id,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: "7d",
			}
		);

		return res.status(200).json({
			success: true,
			message: "Email verified successfully",
			token,
			user: {
				id: user._id,
				name: user.name,
				phone: user.phone,
				email: user.email,
				isVerified: true,
			},
		});
	} catch (error) {
		console.error("OTP verification error:", error);

		res.status(500).json({
			success: false,
			message: "Something went wrong while verifying OTP",
		});
	}
};

const resendOTP = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				success: false,
				message: "Email is required",
			});
		}

		const user = await User.findOne({
			email: email.toLowerCase().trim(),
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		if (user.isVerified) {
			return res.status(400).json({
				success: false,
				message: "Email is already verified",
			});
		}

		const otpRequest = prepareOTPRequest(user);

		if (!otpRequest.allowed) {
			return res.status(429).json({
				success: false,
				message: otpRequest.message,
			});
		}

		await user.save();

		await sendOTPEmail(user.email, otpRequest.otp);

		res.status(200).json({
			success: true,
			message: "A new OTP has been generated",
		});
	} catch (error) {
		console.error("Resend OTP error:", error);

		res.status(500).json({
			success: false,
			message: "Something went wrong while resending OTP",
		});
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Email and password are required",
			});
		}

		const user = await User.findOne({
			email: email.toLowerCase().trim(),
		});

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		const passwordMatch = await bcrypt.compare(
			password,
			user.password
		);

		if (!passwordMatch) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		if (!user.isVerified) {
			const otpRequest = prepareOTPRequest(user);

			if (otpRequest.allowed) {
				await user.save();
				await sendOTPEmail(user.email, otpRequest.otp);
			}

			return res.status(200).json({
				success: true,
				requiresVerification: true,
				message: otpRequest.allowed
					? "A verification code has been sent to your email."
					: otpRequest.message,
				user: {
					id: user._id,
					name: user.name,
					phone: user.phone,
					email: user.email,
					isVerified: false,
				},
			});
		}

		const token = jwt.sign(
			{
				userId: user._id,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: "7d",
			}
		);

		return res.status(200).json({
			success: true,
			message: "Login successful",
			requiresVerification: false,
			token,
			user: {
				id: user._id,
				name: user.name,
				phone: user.phone,
				email: user.email,
				isVerified: true,
			},
		});
	} catch (error) {
		console.error("Login error:", error);

		res.status(500).json({
			success: false,
			message: "Something went wrong during login",
		});
	}
};

const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select(
			"-password -otp -otpExpiry"
		);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			user,
		});
	} catch (error) {
		console.error("Get user error:", error);

		res.status(500).json({
			success: false,
			message: "Unable to fetch user details",
		});
	}
};

module.exports = {
	register,
	verifyOTP,
	resendOTP,
	login,
	getMe,
};
