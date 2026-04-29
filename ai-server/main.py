from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

# Load env vars for this process so /health and backend routing are accurate
load_dotenv(Path(__file__).with_name(".env"))
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI()

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run CPU-heavy tasks in a thread pool to prevent blocking
executor = ThreadPoolExecutor(max_workers=1)  # 1 worker is safe for CPU
_generate_image = None
GENERATION_TIMEOUT_SECONDS = float(os.getenv("GENERATION_TIMEOUT_SECONDS", "180"))


def _is_truthy(value: str) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _resolve_image_backend() -> str:
    if _is_truthy(os.getenv("HF_USE_REMOTE_INFERENCE", "false")):
        return "hf-inference-api"
    return "diffusers-flux-local"


def _get_generate_image():
    """
    Lazy-load heavy ML dependencies so API can boot even if they are missing.
    """
    global _generate_image
    if _generate_image is None:
        from generate import generate_image
        _generate_image = generate_image
    return _generate_image


async def _generate_with_image_backend(prompt_text: str) -> str:
    """
    Run the blocking image generation function in a thread pool executor
    so it does not block the FastAPI event loop.
    """
    generate_image = _get_generate_image()
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, generate_image, prompt_text)


class Prompt(BaseModel):
    text: str


async def _run_generation(prompt_text: str) -> dict:
    """Shared logic for both /generate and /api/generate endpoints."""
    cleaned_prompt = (prompt_text or "").strip()
    if not cleaned_prompt:
        raise HTTPException(status_code=422, detail="Prompt text cannot be empty.")

    try:
        img_base64 = await asyncio.wait_for(
            _generate_with_image_backend(cleaned_prompt),
            timeout=GENERATION_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"Image generation timed out after {GENERATION_TIMEOUT_SECONDS:.0f}s.",
        )
    except ModuleNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Missing dependency: {exc.name}. Install backend ML requirements to generate images.",
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Image generation failed: {exc}")

    if not img_base64:
        raise HTTPException(status_code=502, detail="Image generation returned empty result.")

    return {"image_base64": img_base64}


@app.post("/generate")
@app.post("/api/generate")
async def generate(prompt: Prompt):
    """
    Generate image in a thread to avoid blocking the FastAPI event loop.
    Supports both legacy and API-prefixed routes.
    """
    return await _run_generation(prompt.text)


@app.get("/")
def root():
    return {"message": "AI Artisian Product Design Generator is running."}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "image_backend": _resolve_image_backend(),
        "hf_image_model": os.getenv("HF_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell"),
        "generation_timeout_seconds": GENERATION_TIMEOUT_SECONDS,
    }


@app.on_event("shutdown")
def shutdown_event():
    # Prevent thread leaks when reloading/stopping the API server.
    executor.shutdown(wait=False, cancel_futures=True)
