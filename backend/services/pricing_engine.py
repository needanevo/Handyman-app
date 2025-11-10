from typing import Dict, List, Any, Optional
from decimal import Decimal, ROUND_HALF_UP
from models.service import Service, PricingModel
from models.quote import QuoteItem
from providers.base import AiQuoteSuggestion


class PricingEngine:
    """Deterministic pricing engine - AI only suggests, this calculates final prices"""

    def __init__(self, base_hourly_rate: float = 95.0, tax_rate: float = 0.0875):
        self.base_hourly_rate = base_hourly_rate
        self.tax_rate = tax_rate  # 8.75% default (NYC area)
        self.minimum_charge = 50.0
        self.trip_fee_distance_threshold = 15  # miles
        self.trip_fee_amount = 25.0

    def calculate_service_price(
        self,
        service: Service,
        quantity: float = 1.0,
        ai_suggestion: Optional[AiQuoteSuggestion] = None,
        custom_adjustments: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Calculate price for a service based on pricing model and AI suggestions"""

        # Base calculation by pricing model
        if service.pricing_model == PricingModel.FLAT:
            base_price = service.base_price * quantity
            billable_hours = None

        elif service.pricing_model == PricingModel.HOURLY:
            # Use AI suggested hours if available, otherwise use typical duration
            hours = (
                ai_suggestion.estimated_hours
                if ai_suggestion
                else (service.typical_duration / 60.0)
            )

            # Apply complexity multiplier from service config
            hours *= service.labor_multiplier

            # Minimum 1-hour charge, then 15-minute increments
            if hours < 1.0:
                billable_hours = 1.0
            else:
                # Round up to nearest 15 minutes (0.25 hours)
                billable_hours = float(
                    Decimal(str(hours)).quantize(
                        Decimal("0.25"), rounding=ROUND_HALF_UP
                    )
                )

            base_price = billable_hours * self.base_hourly_rate * quantity

        elif service.pricing_model == PricingModel.UNIT:
            # Per unit pricing (sqft, fixture, etc.)
            base_price = service.base_price * quantity
            billable_hours = None

        else:
            base_price = service.base_price * quantity
            billable_hours = None

        # Apply AI complexity adjustment if available
        complexity_multiplier = 1.0
        if ai_suggestion:
            complexity_multiplier = self._get_complexity_multiplier(
                ai_suggestion.complexity_rating
            )
            base_price *= complexity_multiplier

        # Apply service-specific min/max limits
        if service.min_charge:
            base_price = max(base_price, service.min_charge)
        if service.max_charge:
            base_price = min(base_price, service.max_charge)

        # Apply global minimum
        base_price = max(base_price, self.minimum_charge)

        # Apply custom adjustments if provided
        if custom_adjustments:
            if "discount_percentage" in custom_adjustments:
                base_price *= 1 - custom_adjustments["discount_percentage"] / 100
            if "surcharge_amount" in custom_adjustments:
                base_price += custom_adjustments["surcharge_amount"]

        return {
            "base_price": round(base_price, 2),
            "billable_hours": billable_hours,
            "hourly_rate": (
                self.base_hourly_rate
                if service.pricing_model == PricingModel.HOURLY
                else None
            ),
            "complexity_multiplier": complexity_multiplier,
            "ai_suggested": bool(ai_suggestion),
        }

    def _get_complexity_multiplier(self, complexity_rating: int) -> float:
        """Convert AI complexity rating to price multiplier"""
        multipliers = {
            1: 0.8,  # Simple - slight discount
            2: 0.9,  # Easy - small discount
            3: 1.0,  # Moderate - base price
            4: 1.25,  # Challenging - 25% increase
            5: 1.5,  # Expert - 50% increase
        }
        return multipliers.get(complexity_rating, 1.0)

    def calculate_quote_totals(
        self,
        items: List[QuoteItem],
        distance_miles: Optional[float] = None,
        discount_amount: float = 0.0,
        custom_tax_rate: Optional[float] = None,
    ) -> Dict[str, float]:
        """Calculate totals for a complete quote"""

        # Calculate subtotal
        subtotal = sum(item.total_price for item in items)

        # Add trip fee if applicable
        trip_fee = 0.0
        if distance_miles and distance_miles > self.trip_fee_distance_threshold:
            trip_fee = self.trip_fee_amount

        # Apply discount
        discount_amount = min(
            discount_amount, subtotal
        )  # Can't discount more than subtotal

        # Calculate taxable amount
        taxable_amount = subtotal + trip_fee - discount_amount

        # Calculate tax
        tax_rate = custom_tax_rate if custom_tax_rate is not None else self.tax_rate
        tax_amount = taxable_amount * tax_rate

        # Calculate final total
        total_amount = taxable_amount + tax_amount

        return {
            "subtotal": round(subtotal, 2),
            "trip_fee": round(trip_fee, 2),
            "discount_amount": round(discount_amount, 2),
            "taxable_amount": round(taxable_amount, 2),
            "tax_rate": tax_rate,
            "tax_amount": round(tax_amount, 2),
            "total_amount": round(total_amount, 2),
        }

    def create_quote_item(
        self,
        service: Service,
        quantity: float = 1.0,
        description: Optional[str] = None,
        ai_suggestion: Optional[AiQuoteSuggestion] = None,
        selected_addons: Optional[List[str]] = None,
    ) -> QuoteItem:
        """Create a complete quote item with pricing"""

        # Calculate base price
        price_calc = self.calculate_service_price(service, quantity, ai_suggestion)
        base_price = price_calc["base_price"]

        # Add selected add-ons
        addon_total = 0.0
        addon_details = []
        if selected_addons:
            for addon in service.add_ons:
                if addon.id in selected_addons:
                    addon_price = addon.price * quantity
                    addon_total += addon_price
                    addon_details.append(
                        {
                            "id": addon.id,
                            "name": addon.name,
                            "price": addon.price,
                            "total": addon_price,
                        }
                    )

        # Calculate final item price
        unit_price = base_price / quantity if quantity > 0 else base_price
        total_price = base_price + addon_total

        # Create description
        if not description:
            description = service.description
            if ai_suggestion and ai_suggestion.suggested_materials:
                description += (
                    f" (Materials: {', '.join(ai_suggestion.suggested_materials[:3])})"
                )

        return QuoteItem(
            service_id=service.id,
            service_title=service.title,
            description=description,
            quantity=quantity,
            unit_price=round(unit_price, 2),
            total_price=round(total_price, 2),
            add_ons=addon_details,
        )

    def estimate_deposit_amount(
        self, total_amount: float, deposit_percentage: float = 0.25
    ) -> float:
        """Calculate recommended deposit amount"""
        deposit = total_amount * deposit_percentage
        # Round to nearest $10 for clean amounts
        return round(deposit / 10) * 10

    def validate_pricing(self, quote_items: List[QuoteItem]) -> List[str]:
        """Validate pricing calculations and return any warnings"""
        warnings = []

        total = sum(item.total_price for item in quote_items)

        # Check for suspiciously low total
        if total < self.minimum_charge:
            warnings.append(
                f"Total amount ${total:.2f} is below minimum charge ${self.minimum_charge:.2f}"
            )

        # Check for suspiciously high total (over $2000)
        if total > 2000:
            warnings.append(
                f"Total amount ${total:.2f} is unusually high - please review"
            )

        # Check individual items
        for item in quote_items:
            if item.unit_price <= 0:
                warnings.append(f"Item '{item.service_title}' has invalid price")

            if item.quantity <= 0:
                warnings.append(f"Item '{item.service_title}' has invalid quantity")

        return warnings
