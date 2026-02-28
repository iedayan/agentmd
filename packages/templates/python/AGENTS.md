# Python Project

AI agent configuration for Python applications with modern development practices.

## Overview

This is a Python project configured for AI agent assistance. Agents can help with development, testing, deployment, and maintenance tasks while following security best practices.

## Development Setup

### Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Install dependencies
```bash
pip install -r requirements.txt
# or
pip install -r requirements-dev.txt
```

### Environment setup
```bash
cp .env.example .env
# Fill in required environment variables
```

## Testing

### Run all tests
```bash
pytest
# or
python -m pytest
```

### Run tests with coverage
```bash
pytest --cov=.
# or
python -m pytest --cov=.
```

### Run specific test file
```bash
pytest tests/test_specific.py
# or
python -m pytest tests/test_specific.py
```

### Run tests with verbose output
```bash
pytest -v
# or
python -m pytest -v
```

## Code Quality

### Lint code with flake8
```bash
flake8 .
# or
python -m flake8 .
```

### Format code with black
```bash
black .
# or
python -m black .
```

### Sort imports with isort
```bash
isort .
# or
python -m isort .
```

### Type checking with mypy
```bash
mypy .
# or
python -m mypy .
```

### Run all quality checks
```bash
pre-commit run --all-files
# or
tox
```

## Dependencies

### Install new package
```bash
pip install package_name
# Add to requirements.txt
pip freeze > requirements.txt
```

### Update dependencies
```bash
pip install --upgrade -r requirements.txt
```

### Check for security vulnerabilities
```bash
pip-audit
# or
safety check
```

## Database Operations

### Run migrations (Django)
```bash
python manage.py migrate
```

### Create migrations (Django)
```bash
python manage.py makemigrations
```

### Run database migrations (FastAPI/SQLAlchemy)
```bash
alembic upgrade head
```

### Create migration (FastAPI/SQLAlchemy)
```bash
alembic revision --autogenerate -m "description"
```

## Build & Deployment

### Build Docker image
```bash
docker build -t app-name .
```

### Run Docker container
```bash
docker run -p 8000:8000 app-name
```

### Deploy to production
```bash
# Deployment commands vary by platform
# Examples:
# Heroku: git push heroku main
# AWS: eb deploy
# DigitalOcean: doctl apps create
```

## Security & Compliance

### Security scan
```bash
bandit -r .
# or
python -m bandit -r .
```

### Check dependencies for vulnerabilities
```bash
pip-audit
# or
safety check -r requirements.txt
```

### Run security tests
```bash
pytest tests/security/
```

## Performance

### Profile code
```bash
python -m cProfile -o profile.stats script.py
```

### Run performance tests
```bash
pytest tests/performance/ --benchmark-only
```

### Memory profiling
```bash
python -m memory_profiler script.py
```

## Agent Guidelines

### What agents can do:
- ✅ Run tests and analyze results
- ✅ Build and validate the application
- ✅ Review code for PEP 8 compliance
- ✅ Update dependencies (with approval)
- ✅ Generate documentation
- ✅ Create and update modules
- ✅ Fix bugs and implement features
- ✅ Optimize performance

### Security restrictions:
- 🚫 Never access environment variables directly
- 🚫 Never modify production database
- 🚫 Never expose sensitive data
- 🚫 Always use virtual environments
- 🚫 Require approval for dependency updates
- 🚫 Never commit secrets to version control

### File structure awareness:
- `src/` - Main application code
- `tests/` - Test files
- `docs/` - Project documentation
- `scripts/` - Utility scripts
- `config/` - Configuration files
- `requirements.txt` - Production dependencies
- `requirements-dev.txt` - Development dependencies

### Common patterns:
- Follow PEP 8 style guidelines
- Use type hints for all functions
- Write comprehensive docstrings
- Add tests for new functionality
- Use virtual environments
- Implement proper error handling
- Follow existing code patterns

### Framework-specific guidelines:

#### Django:
- Use Django management commands
- Follow Django best practices
- Use Django ORM properly
- Implement proper middleware

#### FastAPI:
- Use Pydantic models
- Implement proper API documentation
- Use dependency injection
- Follow async/await patterns

#### Flask:
- Use Flask blueprints
- Implement proper error handlers
- Use Flask extensions appropriately
- Follow Flask conventions

## Troubleshooting

### Common issues and solutions:
1. **Import errors** - Check PYTHONPATH and virtual environment
2. **Dependency conflicts** - Use pip-tools or pipenv
3. **Test failures** - Check test configuration and fixtures
4. **Performance issues** - Profile code and optimize bottlenecks
5. **Security issues** - Run security scans and update dependencies

### Getting help:
- Check Python documentation: https://docs.python.org
- Review framework-specific documentation
- Check error logs and tracebacks
- Ask agents to analyze specific error messages
- Review pytest output for test failures

## Contributing

When contributing:
1. Create a virtual environment
2. Install development dependencies
3. Create a feature branch
4. Follow PEP 8 guidelines
5. Add tests for new functionality
6. Update documentation
7. Submit a pull request for review

Agents can help with all of these steps while maintaining code quality, security standards, and Python best practices.
