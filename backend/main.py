from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, restaurants, ai, helpdesk

# ─────────────────────────────────────────
# CREATE THE FASTAPI APP
# ─────────────────────────────────────────

app = FastAPI(
    title="Restaurant Discovery & Lead Management Platform",
    description="AI-powered restaurant search and lead management with Gemini integration",
    version="1.0.0",
    docs_url="/docs",      # Swagger UI lives here — visit http://localhost:8000/docs
    redoc_url="/redoc"
)

# ─────────────────────────────────────────
# CORS — allow the React frontend to call this API
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# REGISTER ROUTES
# ─────────────────────────────────────────

app.include_router(auth.router)
app.include_router(restaurants.router)
app.include_router(ai.router)
app.include_router(helpdesk.router)


# ─────────────────────────────────────────
# HEALTH CHECK — quick way to verify the server is running
# ─────────────────────────────────────────

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Restaurant Platform API is running"}
