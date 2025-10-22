const request = require('supertest');
const express = require('express');
const { sequelize } = require('../../models');
const authRoutes = require('../../routes/authRoutes');
const userRoutes = require('../../routes/userRoutes'); // Para criar usuário de teste
const authConfig = require('../../config/auth');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes); // Adicionar rotas de usuário para poder criar usuários de teste

describe('Authentication Integration Tests', () => {
  let testUser;
  const testPassword = 'password123';

  // Antes de todos os testes, conecta ao banco de dados e cria um usuário de teste
  beforeAll(async () => {
    process.env.NODE_ENV = 'test'; // Usar a configuração de teste do Sequelize
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Limpa e recria as tabelas

    const hashedPassword = await bcrypt.hash(testPassword, 10);
    testUser = await sequelize.models.User.create({
      id: uuidv4(),
      name: 'Test User',
      email: 'integration@example.com',
      password: hashedPassword,
      profile: 'user',
    });
  });

  // Depois de todos os testes, fecha a conexão com o banco de dados
  afterAll(async () => {
    await sequelize.close();
  });

  it('should successfully log in a user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testPassword,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toEqual(testUser.email);
    expect(res.body.user).not.toHaveProperty('password'); // Não deve retornar a senha

    const decoded = jwt.verify(res.body.token, authConfig.secret);
    expect(decoded.id).toEqual(testUser.id);
    expect(decoded.profile).toEqual(testUser.profile);

    // Verificar se o log de acesso foi criado
    const accessLog = await sequelize.models.AccessLog.findOne({ where: { userId: testUser.id } });
    expect(accessLog).toBeDefined();
    expect(accessLog.userId).toEqual(testUser.id);
    expect(accessLog.ipAddress).toBeDefined();
  });

  it('should return 400 for invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid password');
  });

  it('should return 400 for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: testPassword,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'User not found');
  });

  it('should return 401 for invalid token when accessing protected route', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error', 'Token invalid');
  });

  it('should return 401 for no token provided when accessing protected route', async () => {
    const res = await request(app)
      .get('/api/users');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error', 'No token provided');
  });
});