# FastAPI environment template

The project’s single authoritative database is the managed **MySQL/TiDB database accessed through Drizzle ORM**. Do not configure PostgreSQL, Prisma, or a second database for this backend.

Use these variables in the runtime environment or a local untracked `.env` file. Do not commit real credentials, tokens, OAuth secrets, or private provider URLs.

```dotenv
VINDICAI_BACKEND_NAME=VindicAI Backend
NODE_ENV=development
HOST=0.0.0.0
PORT=8000
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
REDIS_URL=
LOG_LEVEL=INFO
CORS_ALLOWED_ORIGINS=http://localhost:3000
SESSION_SECRET=
JWT_SECRET=
AI_PROVIDER=disabled
AI_MODEL=
REQUEST_TIMEOUT_SECONDS=30
RATE_LIMIT_PER_MINUTE=120
FEATURE_FLAGS=
```

The current project has managed environment configuration and does not receive a committed `.env.example`; this documentation is the safe equivalent for the FastAPI scaffold.
