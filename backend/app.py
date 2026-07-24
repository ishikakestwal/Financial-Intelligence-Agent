import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import validate_config
from database.supabase import init_db
from api.auth import router as auth_router
from api.upload import router as upload_router
from api.graph import router as graph_router
from api.ai_chat import router as chat_router
from api.investigation import router as investigation_router
from api.reports import router as reports_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("finguard")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Validate config and ensure database tables exist before serving traffic."""
    validate_config()
    init_db()
    logger.info("FinGuard backend started.")
    yield


app = FastAPI(title="FinGuard Backend", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(graph_router)
app.include_router(chat_router)
app.include_router(investigation_router)
app.include_router(reports_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
