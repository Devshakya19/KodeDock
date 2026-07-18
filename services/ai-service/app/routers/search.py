from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.limiter import limiter

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    category: str | None = None
    min_price: int | None = None
    max_price: int | None = None


class SearchResponse(BaseModel):
    products: list
    total: int
    query: str


@router.post("/", response_model=SearchResponse)
@limiter.limit("30/minute")
async def search_products(request: Request, body: SearchRequest):
    # TODO: Implement AI-powered search
    return SearchResponse(
        products=[],
        total=0,
        query=body.query,
    )
