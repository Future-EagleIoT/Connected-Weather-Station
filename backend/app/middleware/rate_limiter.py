# ============================================================
#  Rate Limiting Middleware — sliding window per IP
# ============================================================

import time
from collections import defaultdict
from fastapi import Request, HTTPException, status


class RateLimiter:
    """Simple in-memory sliding window rate limiter."""

    def __init__(self):
        self._windows: dict[str, list[float]] = defaultdict(list)

    def _clean_window(self, key: str, window_seconds: int) -> None:
        """Remove timestamps older than the window."""
        cutoff = time.time() - window_seconds
        self._windows[key] = [t for t in self._windows[key] if t > cutoff]

    def check(self, key: str, max_requests: int, window_seconds: int = 60) -> None:
        """Raise 429 if rate limit exceeded."""
        self._clean_window(key, window_seconds)

        if len(self._windows[key]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Max {max_requests} requests per {window_seconds}s.",
            )

        self._windows[key].append(time.time())


# Singleton instance
rate_limiter = RateLimiter()


def get_client_ip(request: Request) -> str:
    """Extract client IP, respecting X-Forwarded-For behind proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
