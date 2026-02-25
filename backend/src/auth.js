"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = exports.verifyPassword = exports.hashPassword = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("./db"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
// 生成JWT token
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
// 验证token
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
// 密码加密
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
// 密码验证
const verifyPassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
// 用户注册
const registerUser = async (username, email, password, fullName) => {
    const hashedPassword = await (0, exports.hashPassword)(password);
    try {
        const result = await db_1.default.query('INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name', [username, email, hashedPassword, fullName]);
        return { success: true, user: result.rows[0] };
    }
    catch (error) {
        return { success: false, error: 'Registration failed' };
    }
};
exports.registerUser = registerUser;
// 用户登录
const loginUser = async (email, password) => {
    try {
        const result = await db_1.default.query('SELECT id, username, email, password_hash, full_name FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return { success: false, error: 'User not found' };
        }
        const user = result.rows[0];
        const isPasswordValid = await (0, exports.verifyPassword)(password, user.password_hash);
        if (!isPasswordValid) {
            return { success: false, error: 'Invalid password' };
        }
        const token = (0, exports.generateToken)(user.id);
        return {
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
            },
        };
    }
    catch (error) {
        return { success: false, error: 'Login failed' };
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=auth.js.map