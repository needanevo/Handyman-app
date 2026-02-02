"""
Add these two endpoints after the respond_to_quote function in server.py
"""

ENDPOINTS = """
@api_router.post("/quotes/{quote_id}/accept")
async def accept_quote(
    quote_id: str,
    customer_notes: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency),
):
    \"\"\"Convenience endpoint to accept a quote\"\"\"
    response = QuoteResponse(accept=True, customer_notes=customer_notes)
    return await respond_to_quote(quote_id, response, current_user)


@api_router.post("/quotes/{quote_id}/reject")
async def reject_quote(
    quote_id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency),
):
    \"\"\"Convenience endpoint to reject a quote\"\"\"
    response = QuoteResponse(accept=False, customer_notes=reason)
    return await respond_to_quote(quote_id, response, current_user)
"""
