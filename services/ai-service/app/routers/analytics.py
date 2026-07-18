from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.limiter import limiter

router = APIRouter()


class AnalyticsResponse(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: int


@router.get("/dashboard", response_model=AnalyticsResponse)
@limiter.limit("30/minute")
async def get_dashboard_analytics(request: Request):
    # TODO: Implement real analytics
    return AnalyticsResponse(
        total_users=0,
        total_products=0,
        total_orders=0,
        total_revenue=0,
    )
