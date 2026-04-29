import base64
import io
import os
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

HF_IMAGE_MODEL = os.getenv("HF_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell")
HF_INFERENCE_TOKEN = os.getenv("HF_INFERENCE_TOKEN")
HF_INFERENCE_ENDPOINT = os.getenv(
    "HF_INFERENCE_ENDPOINT",
    f"https://api-inference.huggingface.co/models/{HF_IMAGE_MODEL}",
)
HF_USE_REMOTE_INFERENCE = os.getenv("HF_USE_REMOTE_INFERENCE", "false").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}
HF_REMOTE_TIMEOUT_SECONDS = float(os.getenv("HF_REMOTE_TIMEOUT_SECONDS", "240"))
HF_IMAGE_SEED = os.getenv("HF_IMAGE_SEED")

_PIPELINE = None


def _get_device() -> str:
    import torch

    if torch.cuda.is_available():
        return "cuda"
    if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def _get_dtype(device: str):
    import torch

    if device == "cuda":
        return torch.bfloat16
    if device == "mps":
        return torch.float16
    return torch.float32


def _get_pipeline() -> Any:
    global _PIPELINE

    if _PIPELINE is None:
        from diffusers import DiffusionPipeline

        device = _get_device()
        dtype = _get_dtype(device)
        pipeline_kwargs = {"torch_dtype": dtype}
        # Only pass token when explicitly provided. Passing True forces auth
        # and breaks public model downloads on fresh local environments.
        if HF_INFERENCE_TOKEN and HF_INFERENCE_TOKEN.strip():
            pipeline_kwargs["token"] = HF_INFERENCE_TOKEN.strip()

        _PIPELINE = DiffusionPipeline.from_pretrained(
            HF_IMAGE_MODEL,
            **pipeline_kwargs,
        )
        _PIPELINE = _PIPELINE.to(device)

    return _PIPELINE


def _generate_image_remote(prompt: str) -> str:
    headers = {}
    if HF_INFERENCE_TOKEN:
        headers["Authorization"] = f"Bearer {HF_INFERENCE_TOKEN}"

    payload = {"inputs": prompt}
    parameters = {}
    if HF_IMAGE_SEED and HF_IMAGE_SEED.strip().isdigit():
        parameters["seed"] = int(HF_IMAGE_SEED.strip())
    if parameters:
        payload["parameters"] = parameters

    response = requests.post(
        HF_INFERENCE_ENDPOINT,
        headers=headers,
        json=payload,
        timeout=HF_REMOTE_TIMEOUT_SECONDS,
    )

    content_type = response.headers.get("content-type", "")
    if response.ok and content_type.startswith("image/"):
        return base64.b64encode(response.content).decode("utf-8")

    try:
        error_payload = response.json()
    except ValueError:
        error_payload = {"error": response.text or "Unknown remote inference error."}

    if response.status_code == 503:
        raise RuntimeError(
            "Remote model is loading on Hugging Face. Retry after a short wait."
        )

    if response.status_code >= 400:
        raise RuntimeError(f"Remote inference failed: {error_payload}")

    raise RuntimeError(
        f"Unexpected remote inference response. Content-Type: {content_type}"
    )


def _generate_image_local(prompt: str) -> str:
    try:
        pipe = _get_pipeline()
        image = pipe(prompt).images[0]
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            f"Local inference missing dependency: {exc.name}. Install backend requirements and retry."
        ) from exc
    except Exception as exc:
        raise RuntimeError(f"Local FLUX inference failed: {exc}") from exc

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    return base64.b64encode(buffer.read()).decode("utf-8")


def generate_image(prompt: str) -> str:
    """Generate an image from prompt and return it as a base64 PNG string."""
    if HF_USE_REMOTE_INFERENCE:
        return _generate_image_remote(prompt)

    return _generate_image_local(prompt)