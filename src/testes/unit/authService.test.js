const AuthService = require('../../services/authService');
const { User, AccessLog } = require('../../models');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const bcrypt = require('bcryptjs');

jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
  },
  AccessLog: {
    create: jest.fn(),
  },
}));

describe('AuthService', () => {
  let mockUser;

  beforeEach(() => {
    User.findOne.mockReset();
    AccessLog.create.mockReset();

    mockUser = {
      id: 'some-uuid',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      profile: 'user',
      checkPassword: jest.fn(),
    };
  });

  it('should successfully log in a user with correct credentials', async () => {
    User.findOne.mockResolvedValue(mockUser);
    mockUser.checkPassword.mockResolvedValue(true);

    const { user, token } = await AuthService.login('test@example.com', 'password123', '127.0.0.1');

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(mockUser.checkPassword).toHaveBeenCalledWith('password123');
    expect(AccessLog.create).toHaveBeenCalledWith({
      userId: mockUser.id,
      ipAddress: '127.0.0.1',
    });
    expect(user).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      profile: mockUser.profile,
    });
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, authConfig.secret);
    expect(decoded.id).toBe(mockUser.id);
    expect(decoded.profile).toBe(mockUser.profile);
  });

  it('should throw an error if user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(AuthService.login('nonexistent@example.com', 'password123', '127.0.0.1'))
      .rejects.toThrow('User not found');
    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
    expect(AccessLog.create).not.toHaveBeenCalled();
  });

  it('should throw an error if password is invalid', async () => {
    User.findOne.mockResolvedValue(mockUser);
    mockUser.checkPassword.mockResolvedValue(false);

    await expect(AuthService.login('test@example.com', 'wrongpassword', '127.0.0.1'))
      .rejects.toThrow('Invalid password');
    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(mockUser.checkPassword).toHaveBeenCalledWith('wrongpassword');
    expect(AccessLog.create).not.toHaveBeenCalled();
  });
});