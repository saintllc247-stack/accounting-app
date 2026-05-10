from pathlib import Path
import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.config import settings
from app.routers import auth_router, categories, clients, transactions, invoices, reports

app = FastAPI(title="Accounting App", version="1.0.0", debug=settings.DEBUG)


@app.exception_handler(Exception)
async def global_exception(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": f"{type(exc).__name__}: {exc}"})


origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(categories.router)
app.include_router(clients.router)
app.include_router(transactions.router)
app.include_router(invoices.router)
app.include_router(reports.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/health/db")
def health_db():
    from sqlalchemy import text, inspect
    from app.database import SessionLocal
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        insp = inspect(engine)
        tables = insp.get_table_names()
        return {"status": "ok", "database": "connected", "tables": tables}
    except Exception as e:
        return {"status": "error", "database": str(e), "tables": []}


@app.get("/api/health/migrate")
def migrate():
    from sqlalchemy import inspect
    try:
        Base.metadata.create_all(bind=engine)
        insp = inspect(engine)
        tables = insp.get_table_names()
        return {"status": "ok", "tables": tables}
    except Exception as e:
        return {"status": "error", "detail": f"{type(e).__name__}: {e}"}


static_dir = Path(__file__).resolve().parent.parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
