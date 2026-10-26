# Kerala Lottery Hub & Prediction Suite

A production-ready, comprehensive application for Kerala State Lottery result analysis, historical data management, and experimental statistical evaluation.

## Features

- **Official Results Integration**: Automated collection and verification of Kerala lottery results
- **7 Independent Lotteries**: Bhagyathara, Sthree-Sakthi, Dhanalekshmi, Karunya Plus, Suvarna Keralam, Karunya, Samrudhi
- **Historical Data Management**: Verified record storage with audit trails and conflict detection
- **Statistical Analysis**: Frequency analysis, digit patterns, recency-weighted models
- **5 Candidate Selection Methods**: Composite, exact-ending frequency, recency-weighted, positional, random baseline
- **Walk-Forward Backtesting**: Rigorous evaluation without future-data leakage
- **Multiple-Comparison Correction**: Proper statistical significance testing
- **Data Integrity Monitoring**: Comprehensive verification and issue tracking
- **Offline Access**: Cached verified results survive source outages
- **Bilingual Interface**: Full English and Malayalam support
- **Production Ready**: Docker deployment, CI/CD, comprehensive testing

## Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 16+ (or use Docker Compose)

## Quick Start

### 1. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Install Dependencies

```bash
npm install
npm run prisma:generate
```

### 3. Database Setup

```bash
npm run db:migrate
npm run db:seed  # Optional: seed with test data
```

### 4. Development Mode

```bash
npm run dev
```

This starts:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

### 5. Docker Deployment

```bash
docker-compose up --build
```

## Project Structure

```
kerala-lottery-hub/
├── apps/
│   ├── api/              # Express backend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── middleware/
│   │   ├── tests/
│   │   └── package.json
│   └── web/              # React frontend
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   └── services/
│       └── package.json
├── packages/
│   ├── shared/           # Shared types and schemas
│   ├── statistics/       # Statistical engine
│   └── data-ingestion/   # Source integration
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Scripts

### Development
- `npm run dev` - Start dev servers
- `npm run build` - Build all packages
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run format` - Format code with Prettier

### Testing
- `npm run test` - Run unit and integration tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:e2e` - End-to-end tests

### Database
- `npm run db:migrate` - Apply migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed with test data

## API Documentation

Base URL: `http://localhost:3001/api/v1`

### Endpoints

- `GET /health` - Application health
- `GET /lotteries` - List all lotteries
- `GET /lotteries/:code/results/latest` - Latest result
- `GET /draws` - Search historical draws
- `GET /draws/:id` - Draw details
- `POST /sync` - Manually trigger synchronization
- `GET /analysis/:lotteryCode/frequency` - Frequency analysis
- `POST /candidates/generate` - Generate candidates
- `GET /backtests` - Backtesting results
- `GET /reports/:id` - Download report

See `docs/API.md` for complete documentation.

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Recharts for visualizations
- TanStack Query for state management
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL

### Testing
- Vitest for unit tests
- React Testing Library
- Supertest for API tests
- Playwright for E2E tests

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- ESLint, Prettier, TypeScript

## Configuration

### Lotteries
Seven Kerala lotteries are pre-configured:

| Day       | Lottery         | Code |
|-----------|-----------------|------|
| Monday    | Bhagyathara     | BT   |
| Tuesday   | Sthree-Sakthi   | SS   |
| Wednesday | Dhanalekshmi    | DL   |
| Thursday  | Karunya Plus    | KN   |
| Friday    | Suvarna Keralam | SK   |
| Saturday  | Karunya         | KR   |
| Sunday    | Samrudhi        | SM   |

### Statistical Parameters

Edit `.env` to configure:
- `BACKTESTING_MIN_SAMPLE_SIZE` - Minimum draws for statistical validity
- `BACKTESTING_MONTE_CARLO_ITERATIONS` - Simulation count for p-value calculation
- `BACKTESTING_ALPHA` - Significance level (default: 0.05)

## Important Notes

### Data Integrity
- All lottery numbers stored as strings to preserve leading zeroes
- Full audit trail for all data ingestion
- Duplicate detection and conflict resolution
- Verification status tracking for every record

### Statistical Rigor
- Walk-forward evaluation prevents future-data leakage
- Random baseline comparison for all methods
- Monte Carlo p-value estimation
- Multiple-comparison correction (Bonferroni/Holm)
- Data-sufficiency reporting
- No claims of guaranteed predictions

### Limitations
- Lottery results are inherently random draws
- Historical frequency analysis is purely descriptive
- Statistical findings apply only to analyzed data
- No method provides reliable winning number prediction
- Backend requires external source access for official results

## Troubleshooting

### Database Connection Failed
```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Port Already in Use
Modify ports in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # PostgreSQL
  - "3002:3001"  # API
  - "3001:3000"  # Web
```

### Build Failures
```bash
npm ci  # Clean install
npm run prisma:generate
npm run build
```

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups configured
- [ ] HTTPS/SSL enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] CI/CD pipeline verified
- [ ] Security audit completed

### Docker Production Deployment
```bash
docker build -t kerala-lottery-api --target api-runtime .
docker build -t kerala-lottery-web --target web-runtime .
docker run -e DATABASE_URL=... kerala-lottery-api
```

## Contributing

1. Create a feature branch
2. Run tests: `npm test`
3. Check types: `npm run type-check`
4. Format code: `npm run format`
5. Submit PR with description

## License

Proprietary - Kerala Lottery Hub & Prediction Suite

## Support

For issues and questions, please refer to:
- Documentation: `docs/`
- API Reference: `docs/API.md`
- Statistical Methodology: `docs/STATISTICS.md`
