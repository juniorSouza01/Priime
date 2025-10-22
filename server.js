require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Para parsear JSON no corpo das requisições

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

// Conecta ao banco de dados e inicia o servidor
sequelize.sync() // sync() para criar tabelas se não existirem (apenas para desenvolvimento, em prod usar migrations)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });