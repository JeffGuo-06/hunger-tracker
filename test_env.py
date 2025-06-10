#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

def test_environment():
    print("\n=== Testing Environment ===")
    print(f"Python version: {sys.version}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Directory contents: {os.listdir('.')}")
    
    # Check required environment variables
    required_vars = [
        'DJANGO_SETTINGS_MODULE',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'DB_HOST',
        'REDIS_URL',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_STORAGE_BUCKET_NAME'
    ]
    
    print("\n=== Environment Variables ===")
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if 'PASSWORD' in var or 'KEY' in var:
                value = '***'
            print(f"{var}: {value}")
        else:
            print(f"{var}: NOT SET")
    
    # Test Django setup
    print("\n=== Testing Django Setup ===")
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'muckd.settings')
        django.setup()
        print("Django setup successful")
        
        # Test database connection
        from django.db import connection
        connection.ensure_connection()
        print("Database connection successful")
        
        # Test Redis connection
        from django.core.cache import cache
        cache.set('test_key', 'test_value', 1)
        print("Redis connection successful")
        
    except Exception as e:
        print(f"Error during setup: {str(e)}")
        import traceback
        print("\nFull traceback:")
        print(traceback.format_exc())
        raise

    print("\n=== Environment Test Complete ===\n")

if __name__ == "__main__":
    test_environment() 