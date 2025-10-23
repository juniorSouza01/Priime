# API de Controle de Acesso Simples

Esta é uma API RESTful para um sistema simples de controle de acesso, construída com Node.js, Express, Sequelize e PostgreSQL, e containerizada com Docker.

## Requisitos

- Docker
- Docker Compose

## Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd <NOME_DA_PASTA>
    ```

2.  **Crie o arquivo `.env`** na raiz do projeto, baseado no exemplo abaixo:
    ```env
    DB_USER=admin
    DB_PASSWORD=12345678
    DB_NAME=accesscontrol
    JWT_SECRET=seu_segredo_jwt_super_secreto
    PORT=3000
    ```

3.  **Suba os containers com Docker Compose:**
    ```bash
    docker-compose up --build
    ```

A API estará disponível em `http://localhost:3000`.

## Endpoints da API

### Autenticação

-   **`POST /api/auth/login`**: Realiza o login de um usuário.
    -   **Body:**
        ```json
        {
          "email": "admin@example.com",
          "password": "admin123"
        }
        ```
    -   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "user": {
            "id": "...",
            "name": "Admin User",
            "email": "admin@example.com",
            "profile": "admin"
          },
          "token": "seu.jwt.token"
        }
        ```

### Usuários

-   **`POST /api/users`**: Cria um novo usuário. Acessível publicamente.
    -   **Body:**
        ```json
        {
          "name": "Novo Usuário",
          "email": "novo@example.com",
          "password": "senha_forte",
          "profile": "user"
        }
        ```
    -   **Resposta de Sucesso (201 Created):**
        ```json
        {
            "id": "...",
            "name": "Novo Usuário",
            "email": "novo@example.com",
            "profile": "user"
        }
        ```

-   **`GET /api/users`**: Lista todos os usuários.
    -   **Autenticação Requerida:** Sim (Bearer Token)
    -   **Permissão Requerida:** Perfil `admin`
    -   **Headers:**
        ```
        Authorization: Bearer <seu.jwt.token>
        ```
    -   **Resposta de Sucesso (200 OK):**
        ```json
        [
          {
            "id": "...",
            "name": "Admin User",
            "email": "admin@example.com",
            "profile": "admin",
            "createdAt": "...",
            "updatedAt": "..."
          },
          ...
        ]
        ```

## Executando os Testes
Para rodar os testes, execute o seguinte comando:
```bash
npm test
```