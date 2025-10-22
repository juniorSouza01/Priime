# API de Controle de Acesso Simples

Esta é uma API RESTful para controle de acesso de usuários, construída com Node.js, Express, Sequelize, PostgreSQL, e orquestrada com Docker e Docker Compose.

## Requisitos Funcionais

-   **Cadastro de Usuários**:
    -   Campos: `id` (UUID), `nome`, `email` (único), `senha` (criptografada), `perfil` (`admin`, `user`).
-   **Autenticação**:
    -   Endpoint de login que retorna um JSON Web Token (JWT) válido.
-   **Controle de Acesso**:
    -   Apenas usuários com perfil `admin` podem listar todos os usuários.
-   **Logs de Acesso**:
    -   Cada login bem-sucedido registra um evento (`data/hora`, `usuário`, `IP`) em uma tabela separada.

## Requisitos Técnicos

-   Estrutura modular com princípios de DDD ou Clean Architecture.
-   Aplicação de TDD (Test-Driven Development) em pelo menos uma parte crítica (ex: autenticação).
-   Documentação dos endpoints via README.md (poderia ser Swagger para um projeto maior).

## Tecnologias Utilizadas

-   **Backend**: Node.js, Express
-   **ORM**: Sequelize
-   **Banco de Dados**: PostgreSQL
-   **Autenticação**: JWT (JSON Web Tokens), Bcryptjs (criptografia de senhas)
-   **Containerização**: Docker, Docker Compose
-   **Testes**: Jest, Supertest
-   **Ferramentas de Banco de Dados**: Sequelize CLI

## Configuração do Ambiente

### Pré-requisitos

Certifique-se de ter o [Docker](https://www.docker.com/get-started) e o [Docker Compose](https://docs.docker.com/compose/install/) instalados em sua máquina.

### Passos para Subir a Aplicação

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd access-control-api
    ```

2.  **Crie o arquivo de variáveis de ambiente:**
    Na raiz do projeto, crie um arquivo `.env` com o seguinte conteúdo:
    ```
    DB_USER=myuser
    DB_PASSWORD=mypassword
    DB_NAME=accesscontrol
    JWT_SECRET=supersecretjwtkey
    PORT=3000
    ```

3.  **Suba os serviços com Docker Compose:**
    O comando `docker-compose up --build` irá construir a imagem da API (se necessário), iniciar o container do PostgreSQL, e executar as migrações e seeders no banco de dados.
    ```bash
    docker-compose up --build
    ```
    Isso pode levar alguns minutos na primeira vez.

    Para rodar em modo detached (segundo plano):
    ```bash
    docker-compose up -d --build
    ```

4.  **Verifique se a aplicação está rodando:**
    A API estará disponível em `http://localhost:3000`.

## Scripts Úteis

-   **Iniciar a aplicação (com Docker Compose):**
    ```bash
    docker-compose up --build
    ```
-   **Parar a aplicação (com Docker Compose):**
    ```bash
    docker-compose down
    ```
-   **Executar migrações (dentro do container da API):**
    ```bash
    docker-compose exec api npx sequelize-cli db:migrate
    ```
-   **Executar seeders (dentro do container da API):**
    ```bash
    docker-compose exec api npx sequelize-cli db:seed:all
    ```
-   **Executar testes:**
    ```bash
    npm test
    # ou para testes unitários
    npm run test:unit
    # ou para testes de integração
    npm run test:integration
    ```

## Endpoints da API

### Autenticação

-   **`POST /api/auth/login`**
    -   **Descrição**: Realiza o login de um usuário e retorna um JWT.
    -   **Corpo da Requisição**:
        ```json
        {
          "email": "user@example.com",
          "password": "yourpassword"
        }
        ```
    -   **Resposta de Sucesso (200 OK)**:
        ```json
        {
          "user": {
            "id": "uuid-do-usuario",
            "name": "Nome do Usuário",
            "email": "user@example.com",
            "profile": "user"
          },
          "token": "seu-jwt-aqui"
        }
        ```
    -   **Resposta de Erro (400 Bad Request)**:
        ```json
        {
          "error": "User not found"
        }
        ```
        ```json
        {
          "error": "Invalid password"
        }
        ```

### Usuários

-   **`POST /api/users`**
    -   **Descrição**: Cadastra um novo usuário.
    -   **Corpo da Requisição**:
        ```json
        {
          "name": "Novo Usuário",
          "email": "novo@example.com",
          "password": "senhadificil",
          "profile": "user"
        }
        ```
    -   **Resposta de Sucesso (201 Created)**:
        ```json
        {
          "id": "uuid-do-novo-usuario",
          "name": "Novo Usuário",
          "email": "novo@example.com",
          "profile": "user"
        }
        ```
    -   **Resposta de Erro (400 Bad Request)**:
        ```json
        {
          "error": "Validation error"
        }
        ```

-   **`GET /api/users`**
    -   **Descrição**: Lista todos os usuários cadastrados. **Requer perfil `admin`**.
    -   **Headers**:
        ```
        Authorization: Bearer <seu-jwt-aqui>
        ```
    -   **Resposta de Sucesso (200 OK)**:
        ```json
        [
          {
            "id": "uuid-usuario1",
            "name": "Admin User",
            "email": "admin@example.com",
            "profile": "admin",
            "createdAt": "...",
            "updatedAt": "..."
          },
          {
            "id": "uuid-usuario2",
            "name": "Novo Usuário",
            "email": "novo@example.com",
            "profile": "user",
            "createdAt": "...",
            "updatedAt": "..."
          }
        ]
        ```
    -   **Resposta de Erro (401 Unauthorized)**: Token inválido ou não fornecido.
        ```json
        {
          "error": "Token invalid"
        }
        ```
    -   **Resposta de Erro (403 Forbidden)**: Usuário não tem permissão de `admin`.
        ```json
        {
          "error": "Permission denied"
        }
        ```

## Como Testar

1.  **Suba a aplicação** usando `docker-compose up --build`.
2.  **Crie um usuário** com perfil `admin` via seeder (já configurado para rodar no `docker-compose up --build`) ou via endpoint `POST /api/users`.
    -   O seeder já cria `admin@example.com` com senha `admin123`.
3.  **Faça login** com o usuário `admin` para obter um JWT.
    ```bash
    curl -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "admin@example.com", "password": "admin123"}'
    ```
    Você receberá um token.
4.  **Use o token** para acessar o endpoint de listar usuários:
    ```bash
    curl -X GET http://localhost:3000/api/users \
      -H "Authorization: Bearer SEU_TOKEN_AQUI"
    ```
    Isso deve retornar a lista de usuários.
5.  **Tente listar usuários** com um token de um usuário `user` normal ou sem token para observar os erros de permissão.

## Fluxo de Autenticação e Controle de Acesso

1.  Um usuário envia credenciais (`email`, `password`) para `POST /api/auth/login`.
2.  O `authController` chama o `authService`.
3.  O `authService` verifica as credenciais no banco de dados.
4.  Se válidas, um JWT é gerado contendo o `id` e `profile` do usuário.
5.  Um `AccessLog` é registrado no banco de dados.
6.  O JWT é retornado ao cliente.
7.  Para acessar rotas protegidas (ex: `GET /api/users`), o cliente deve enviar o JWT no cabeçalho `Authorization: Bearer <token>`.
8.  O `authMiddleware` intercepta a requisição, verifica a validade do JWT e anexa `req.userId` e `req.userProfile`.
9.  O `permissionMiddleware` (configurado para a rota) verifica se `req.userProfile` tem a permissão necessária (ex: `admin`).
10. Se tudo estiver ok, a requisição prossegue para o controlador.

## Diagrama da Arquitetura