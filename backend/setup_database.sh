#!/bin/bash

# PostgreSQL Database Setup Script for HRMS Lite
# This script creates the database and user for the HRMS application

echo "🚀 Setting up PostgreSQL database for HRMS Lite..."

# Database configuration
DB_NAME="test"
DB_USER="postgres"
DB_PASSWORD="test"
DB_HOST="localhost"
DB_PORT="5432"

echo "📋 Database Configuration:"
echo "  Database Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U postgres >/dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL service."
    echo "   On macOS: brew services start postgresql"
    echo "   On Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database (if it doesn't exist)
echo "📦 Creating database '$DB_NAME'..."
createdb -h $DB_HOST -p $DB_PORT -U postgres $DB_NAME 2>/dev/null || echo "   Database '$DB_NAME' already exists"

# Create user and grant permissions
echo "👤 Creating user '$DB_USER' with permissions..."
psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_roles 
        WHERE rolname = '$DB_USER'
    ) THEN
        CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
" 2>/dev/null || echo "   User '$DB_USER' already exists or permissions already granted"

echo ""
echo "✅ Database setup completed!"
echo ""
echo "🔗 Connection String:"
echo "   postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "📝 Update your .env file with:"
echo "   DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "🎯 Next steps:"
echo "   1. Update your .env file with the database URL above"
echo "   2. Run your FastAPI application"
echo "   3. The tables will be created automatically on first run"
