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
   pip install -r requirements.txt
   ```

3. Set up the database:
   - Create a PostgreSQL database named `api_monitor` (or modify the DATABASE_URL in .env)
   - Ensure PostgreSQL is running on localhost:5432
   - Update the .env file with your database credentials if different:
     ```
     DATABASE_URL=postgresql+psycopg2://postgres:112233@localhost:5432/api_monitor
     ```

## Database Setup

Note: This application does not include automatic database migration or schema creation tools. You will need to:

1. Create the necessary database tables manually, or
2. Add SQLAlchemy models and migration tools (like Alembic) to manage your database schema

To create tables manually, you would typically:
1. Define SQLAlchemy models in the application
2. Use the engine to create tables:
   ```python
   from app.database.connection import engine
   from your_models import Base  # Import your Base class
   Base.metadata.create_all(bind=engine)
   ```

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