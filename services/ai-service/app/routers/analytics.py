from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class AnalyticsResponse(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: int


@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard_analytics():
    # TODO: Implement real analytics
    return AnalyticsResponse(
        total_users=0,
        total_products=0,
        total_orders=0,
        total_revenue=0
    )
