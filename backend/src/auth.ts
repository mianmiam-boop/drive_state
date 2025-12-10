import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import pool from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// 生成JWT token
export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// 验证token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 密码加密
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

// 密码验证
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

// 用户注册
export const registerUser = async (
  username: string,
  email: string,
  password: string,
  fullName: string
) => {
  const hashedPassword = await hashPassword(password);
  
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name',
      [username, email, hashedPassword, fullName]
    );
    return { success: true, user: result.rows[0] };
  } catch (error) {
    return { success: false, error: 'Registration failed' };
  }
};

// 用户登录
export const loginUser = async (email: string, password: string) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash, full_name FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }
    
    const user = result.rows[0];
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid password' };
    }
    
    const token = generateToken(user.id);
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
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};