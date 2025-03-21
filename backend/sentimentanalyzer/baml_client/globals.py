###############################################################################
#
#  Welcome to Baml! To use this generated code, please run the following:
#
#  $ pip install baml-py
#
###############################################################################

# This file was generated by BAML: please do not edit it. Instead, edit the
# BAML files and re-generate this code.
#
# ruff: noqa: E501,F401,F821
# flake8: noqa: E501,F401,F821
# pylint: disable=unused-import,line-too-long
# fmt: off
from __future__ import annotations
import os

from baml_py import BamlCtxManager, BamlRuntime
from baml_py.baml_py import BamlError
from .inlinedbaml import get_baml_files
from typing_extensions import Literal
from typing import Dict, Any

DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME = BamlRuntime.from_files(
  "baml_src",
  get_baml_files(),
  os.environ.copy()
)
DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_CTX = BamlCtxManager(DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME)

def reset_baml_env_vars(env_vars: Dict[str, str]):
  if DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_CTX.allow_reset():
    DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME.reset(
      "baml_src",
      get_baml_files(),
      env_vars
    )
    DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_CTX.reset()
  else:
    raise BamlError("Cannot reset BAML environment variables while there are active BAML contexts.")

try:
    import dotenv
    from unittest.mock import patch

    # Monkeypatch load_dotenv to call reset_baml_env_vars after execution
    original_load_dotenv = dotenv.load_dotenv

    def patched_load_dotenv(*args: Any, **kwargs: Any) -> Any:
        result = original_load_dotenv(*args, **kwargs)
        try:
            reset_baml_env_vars(os.environ.copy())
        except BamlError:
            # swallow the error
            pass
        return result

    patch('dotenv.load_dotenv', patched_load_dotenv).start()
except ImportError:
    # dotenv is not installed, so we do nothing
    pass

__all__ = []
