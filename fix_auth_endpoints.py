#!/usr/bin/env python3
"""
Script to fix authentication dependency injection issues in server.py
"""

import re

def fix_auth_dependencies():
    with open('/app/backend/server.py', 'r') as f:
        content = f.read()
    
    # Fix all the lambda dependency injections
    patterns_to_fix = [
        (r'current_user: User = Depends\(lambda: get_current_user\(auth_handler=auth_handler\)\)',
         'credentials: HTTPAuthorizationCredentials = Depends(security)'),
    ]
    
    for old_pattern, new_pattern in patterns_to_fix:
        content = re.sub(old_pattern, new_pattern, content)
    
    # Add current_user retrieval at the beginning of functions that need it
    functions_to_fix = [
        ('async def get_user_quotes(', 'current_user = await get_current_user(credentials, auth_handler)'),
        ('async def get_quote(', 'current_user = await get_current_user(credentials, auth_handler)'),
        ('async def respond_to_quote(', 'current_user = await get_current_user(credentials, auth_handler)'),
        ('async def add_address(', 'current_user = await get_current_user(credentials, auth_handler)'),
        ('async def get_addresses(', 'current_user = await get_current_user(credentials, auth_handler)'),
    ]
    
    for func_signature, auth_line in functions_to_fix:
        # Find the function and add the auth line after the docstring
        pattern = rf'({func_signature}[^{{]*{{[^"]*"""[^"]*"""[^\n]*\n)'
        replacement = rf'\1    {auth_line}\n'
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open('/app/backend/server.py', 'w') as f:
        f.write(content)
    
    print("Fixed authentication dependencies")

if __name__ == '__main__':
    fix_auth_dependencies()
