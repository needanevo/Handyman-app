"""
Report models for contractor reports
"""
from pydantic import BaseModel
from typing import List, Optional


class MonthlyReport(BaseModel):
    year: int
    month: int
    contractor_id: str
    total_jobs: int
    completed_jobs: int
    total_revenue: float
    total_expenses: float
    total_mileage: float
    total_hours: float
    net_income: float


class YearlyReport(BaseModel):
    year: int
    contractor_id: str
    total_jobs: int
    completed_jobs: int
    total_revenue: float
    total_expenses: float
    total_mileage: float
    total_hours: float
    net_income: float
    monthly_breakdown: List[MonthlyReport]


class TaxReport(BaseModel):
    contractor_id: str
    start_date: str
    end_date: str
    total_revenue: float
    total_expenses: float
    total_mileage: float
    mileage_deduction: float  # IRS standard rate
    total_deductions: float
    net_income: float
    tax_year: int
    disclaimer: str = "For informational purposes only. Not official tax documentation. Consult your tax professional."
