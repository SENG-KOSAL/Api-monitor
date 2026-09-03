# API Monitor

A simple API health monitoring service built with FastAPI.

## Features

- Health check endpoints
- Database connectivity monitoring
- FastAPI framework for high performance
- PostgreSQL database integration

## Project Structure

```
api-monitor/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application entry point
│   │   └── database/
│   │       └── connection.py       # Database connection setup
│   ├── .env                        # Environment variables
│   ├── requirements.txt            # Python dependencies
│   └── .gitignore
└── README.md
```

## Prerequisites

- Python 3.7+
- PostgreSQL database
- pip (Python package manager)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd api-monitor
   ```

2. Install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the database:
   - Create a PostgreSQL database named `api_monitor`
   - Ensure PostgreSQL is running on localhost:5432
   - Update the .env file with your database credentials if different:
     ```
     DATABASE_URL=postgresql+psycopg2://postgres:112233@localhost:5432/api_monitor
     ```
   - Run the migration:
     ```bash
     alembic upgrade head
     ```

## Database Setup

This application uses Alembic for database migrations.

1. Create a PostgreSQL database named `api_monitor`
2. Run the Alembic migration to set up the database schema:
   ```bash
   cd backend
   alembic upgrade head
   ```

This will apply all pending migrations and create the necessary tables.

## Running the Application

### Development Mode

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at:
- http://localhost:8000
- API documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Production Mode

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
uvicorn app.main:app --host 192.168.1.11 --port 8000
```
## API Endpoints

- `GET /` - Returns a welcome message
- `GET /health` - Returns application health status
- `GET /database-health` - Returns database connectivity status

## Environment Variables

The application uses the following environment variable:
- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql+psycopg2://postgres:112233@localhost:5432/api_monitor`)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.