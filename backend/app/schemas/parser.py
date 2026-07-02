from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class RepositoryNode(BaseModel):
    name: str
    path: str
    type: Literal["file", "directory"]
    children: list[RepositoryNode] = []
