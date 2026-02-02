from typing import Dict, Any, List, Optional
import asyncio
from .base import (
    EmailProvider,
    SmsProvider,
    PaymentProvider,
    MapsProvider,
    AiProvider,
    MaterialsPricingProvider,
    AccountingProvider,
    EmailMessage,
    SmsMessage,
    PaymentIntent,
    GeocodeResult,
    RouteResult,
    AiQuoteSuggestion,
    MaterialItem,
    MaterialSearchResult,
    Invoice,
    Expense,
    MockProviderMixin,
)


class MockEmailProvider(EmailProvider, MockProviderMixin):
    def __init__(self, **kwargs):
        super().__init__(mock_mode=True, **kwargs)

    async def send_email(self, message: EmailMessage) -> bool:
        self._mock_log(
            "send_email",
            {"to": message.to, "subject": message.subject, "from": message.from_email},
        )
        await asyncio.sleep(0.1)  # Simulate API delay
        return True

    async def send_template_email(
        self, template_id: str, to: List[str], data: Dict[str, Any]
    ) -> bool:
        self._mock_log(
            "send_template_email", {"template_id": template_id, "to": to, "data": data}
        )
        await asyncio.sleep(0.1)
        return True


class MockSmsProvider(SmsProvider, MockProviderMixin):
    def __init__(self, **kwargs):
        super().__init__(mock_mode=True, **kwargs)

    async def send_sms(self, message: SmsMessage) -> bool:
        self._mock_log(
            "send_sms",
            {
                "to": message.to,
                "message": (
                    message.message[:50] + "..."
                    if len(message.message) > 50
                    else message.message
                ),
                "from": message.from_number,
            },
        )
        await asyncio.sleep(0.1)
        return True


class MockPaymentProvider(PaymentProvider, MockProviderMixin):
    def __init__(self, **kwargs):
        super().__init__(mock_mode=True, **kwargs)
        self._payment_intents = {}

    async def create_payment_intent(
        self, amount: int, currency: str = "usd", metadata: Dict[str, Any] = None
    ) -> PaymentIntent:
        intent_id = f"pi_mock_{len(self._payment_intents) + 1}"
        payment_intent = PaymentIntent(
            id=intent_id,
            amount=amount,
            currency=currency,
            status="requires_payment_method",
            client_secret=f"{intent_id}_secret_mock",
        )
        self._payment_intents[intent_id] = payment_intent

        self._mock_log(
            "create_payment_intent",
            {
                "id": intent_id,
                "amount": amount,
                "currency": currency,
                "metadata": metadata,
            },
        )
        await asyncio.sleep(0.1)
        return payment_intent

    async def confirm_payment(self, payment_intent_id: str) -> PaymentIntent:
        if payment_intent_id in self._payment_intents:
            self._payment_intents[payment_intent_id].status = "succeeded"
            payment_intent = self._payment_intents[payment_intent_id]
        else:
            # Create a mock successful payment for testing
            payment_intent = PaymentIntent(
                id=payment_intent_id,
                amount=10000,  # $100.00
                currency="usd",
                status="succeeded",
            )

        self._mock_log(
            "confirm_payment",
            {"id": payment_intent_id, "status": payment_intent.status},
        )
        await asyncio.sleep(0.1)
        return payment_intent

    async def refund_payment(
        self, payment_intent_id: str, amount: Optional[int] = None
    ) -> Dict[str, Any]:
        refund_data = {
            "id": f"re_mock_{payment_intent_id}",
            "payment_intent": payment_intent_id,
            "amount": amount or 10000,
            "status": "succeeded",
        }

        self._mock_log("refund_payment", refund_data)
        await asyncio.sleep(0.1)
        return refund_data


class MockMapsProvider(MapsProvider, MockProviderMixin):
    def __init__(self, **kwargs):
        super().__init__(mock_mode=True, **kwargs)

    async def geocode(self, address: str) -> Optional[GeocodeResult]:
        # Return mock coordinates for testing
        result = GeocodeResult(
            latitude=40.7128 + (hash(address) % 1000) / 10000,  # Vary by address
            longitude=-74.0060 + (hash(address) % 1000) / 10000,
            formatted_address=f"Mock: {address}, New York, NY, USA",
        )

        self._mock_log("geocode", {"address": address, "result": result.dict()})
        await asyncio.sleep(0.1)
        return result

    async def get_route(self, origin: str, destination: str) -> Optional[RouteResult]:
        # Mock route calculation
        distance_miles = abs(hash(origin + destination)) % 20 + 1
        duration_minutes = distance_miles * 2 + 10

        result = RouteResult(
            distance=f"{distance_miles} miles",
            duration=f"{duration_minutes} mins",
            polyline="mock_polyline_data",
        )

        self._mock_log(
            "get_route",
            {"origin": origin, "destination": destination, "result": result.dict()},
        )
        await asyncio.sleep(0.1)
        return result


class MockAiProvider(AiProvider, MockProviderMixin):
    def __init__(self, **kwargs):
        super().__init__(mock_mode=True, **kwargs)

    async def generate_quote_suggestion(
        self, service_type: str, description: str, photos_metadata: List[str] = None
    ) -> AiQuoteSuggestion:
        # Mock AI suggestion based on service type
        service_configs = {
            "drywall": {
                "base_hours": 3,
                "base_price": 150,
                "materials": ["Drywall sheets", "Joint compound", "Sandpaper"],
            },
            "painting": {
                "base_hours": 4,
                "base_price": 200,
                "materials": ["Paint", "Primer", "Brushes", "Rollers"],
            },
            "electrical": {
                "base_hours": 2,
                "base_price": 180,
                "materials": ["Outlet", "Wire", "Wire nuts"],
            },
            "plumbing": {
                "base_hours": 2.5,
                "base_price": 160,
                "materials": ["Pipe fittings", "Sealant", "Tools"],
            },
            "carpentry": {
                "base_hours": 5,
                "base_price": 250,
                "materials": ["Wood", "Screws", "Wood glue"],
            },
        }

        config = service_configs.get(service_type.lower(), service_configs["drywall"])

        # Add complexity based on description length and keywords
        complexity_multiplier = 1.0
        if len(description) > 100:
            complexity_multiplier += 0.3
        if any(
            word in description.lower()
            for word in ["difficult", "complex", "multiple", "large"]
        ):
            complexity_multiplier += 0.5

        suggestion = AiQuoteSuggestion(
            estimated_hours=config["base_hours"] * complexity_multiplier,
            suggested_materials=config["materials"],
            complexity_rating=min(5, int(complexity_multiplier * 2 + 1)),
            base_price_suggestion=config["base_price"] * complexity_multiplier,
            reasoning=f"Based on {service_type} service type and description analysis. Complexity multiplier: {complexity_multiplier:.2f}",
            confidence=0.75,
        )

        self._mock_log(
            "generate_quote_suggestion",
            {
                "service_type": service_type,
                "description_length": len(description),
                "photos_count": len(photos_metadata or []),
                "suggestion": suggestion.dict(),
            },
        )

        await asyncio.sleep(0.2)  # Simulate AI processing time
        return suggestion


class MockMaterialsPricingProvider(MaterialsPricingProvider, MockProviderMixin):
    def __init__(self, **kwargs):
        super().__init__(mock_mode=True, **kwargs)

    async def search_materials(
        self, query: str, category: Optional[str] = None, zip_code: Optional[str] = None
    ) -> MaterialSearchResult:
        self._mock_log(
            "search_materials",
            {"query": query, "category": category, "zip_code": zip_code}
        )
        await asyncio.sleep(0.1)

        # Mock search results
        mock_items = [
            MaterialItem(
                sku="MOCK-12345",
                name=f"Mock Material: {query}",
                description=f"This is a mock material result for '{query}'",
                price=25.99,
                availability="in_stock",
                store_location="Mock Store #1",
                url=f"https://mock-store.com/search?q={query}"
            )
        ]
        return MaterialSearchResult(items=mock_items, total_results=1)

    async def get_material_by_sku(self, sku: str) -> Optional[MaterialItem]:
        self._mock_log("get_material_by_sku", {"sku": sku})
        await asyncio.sleep(0.1)

        return MaterialItem(
            sku=sku,
            name="Mock Material Item",
            description="Detailed mock material description",
            price=35.99,
            availability="in_stock",
            url=f"https://mock-store.com/product/{sku}"
        )

    async def check_availability(self, sku: str, zip_code: str) -> Dict[str, Any]:
        self._mock_log("check_availability", {"sku": sku, "zip_code": zip_code})
        await asyncio.sleep(0.1)

        return {
            "sku": sku,
            "zip_code": zip_code,
            "in_stock": True,
            "nearby_stores": [
                {"store_id": "MOCK-1", "distance_miles": 1.5, "stock_level": "high"},
                {"store_id": "MOCK-2", "distance_miles": 4.2, "stock_level": "medium"}
            ]
        }


class MockAccountingProvider(AccountingProvider, MockProviderMixin):
    def __init__(self, **kwargs):
        super().__init__(mock_mode=True, **kwargs)

    async def create_invoice(
        self, customer_name: str, amount: float, line_items: List[Dict[str, Any]]
    ) -> Invoice:
        self._mock_log(
            "create_invoice",
            {"customer_name": customer_name, "amount": amount, "line_items": line_items}
        )
        await asyncio.sleep(0.1)

        return Invoice(
            id="MOCK-INV-12345",
            customer_name=customer_name,
            amount=amount,
            status="draft",
            due_date="2025-12-31",
            line_items=line_items
        )

    async def record_expense(
        self, date: str, amount: float, category: str, description: str
    ) -> Expense:
        self._mock_log(
            "record_expense",
            {"date": date, "amount": amount, "category": category, "description": description}
        )
        await asyncio.sleep(0.1)

        return Expense(
            id="MOCK-EXP-67890",
            date=date,
            amount=amount,
            category=category,
            description=description,
            receipt_url=None
        )

    async def get_profit_loss_report(self, start_date: str, end_date: str) -> Dict[str, Any]:
        self._mock_log(
            "get_profit_loss_report",
            {"start_date": start_date, "end_date": end_date}
        )
        await asyncio.sleep(0.2)

        return {
            "report_name": "Mock Profit & Loss",
            "start_date": start_date,
            "end_date": end_date,
            "total_revenue": 5000.00,
            "total_expenses": 2000.00,
            "net_income": 3000.00,
            "categories": [
                {"name": "Income", "amount": 5000.00},
                {"name": "Expenses", "amount": 2000.00}
            ]
        }
