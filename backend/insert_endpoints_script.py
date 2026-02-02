#!/usr/bin/env python3
"""
Script to insert accept/reject endpoints into server.py
"""

import sys

SERVER_FILE = "/srv/app/Handyman-app/backend/server.py"

NEW_ENDPOINTS = '''
@api_router.post("/quotes/{quote_id}/accept")
async def accept_quote(
    quote_id: str,
    current_user: User = Depends(get_current_user_dependency),
):
    """Convenience endpoint to accept a quote"""
    response = QuoteResponse(accept=True, customer_notes=None)
    return await respond_to_quote(quote_id, response, current_user)


@api_router.post("/quotes/{quote_id}/reject")
async def reject_quote(
    quote_id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency),
):
    """Convenience endpoint to reject a quote"""
    response = QuoteResponse(accept=False, customer_notes=reason)
    return await respond_to_quote(quote_id, response, current_user)

'''

try:
    with open(SERVER_FILE, 'r') as f:
        lines = f.readlines()

    # Find the line with @api_router.delete("/quotes/{quote_id}")
    insert_index = None
    for i, line in enumerate(lines):
        if '@api_router.delete("/quotes/{quote_id}")' in line:
            insert_index = i
            break

    if insert_index is None:
        print("ERROR: Could not find delete quote endpoint")
        sys.exit(1)

    # Insert the new endpoints before the delete endpoint
    lines.insert(insert_index, NEW_ENDPOINTS)

    with open(SERVER_FILE, 'w') as f:
        f.writelines(lines)

    print(f"✅ Successfully inserted accept/reject endpoints at line {insert_index}")

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
