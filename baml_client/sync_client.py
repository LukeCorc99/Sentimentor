###############################################################################
#
#  Welcome to Baml! To use this generated code, please run the following:
#
#  $ pip install baml
#
###############################################################################

# This file was generated by BAML: please do not edit it. Instead, edit the
# BAML files and re-generate this code.
#
# ruff: noqa: E501,F401
# flake8: noqa: E501,F401
# pylint: disable=unused-import,line-too-long
# fmt: off
from typing import Any, Dict, List, Optional, TypeVar, Union, TypedDict, Type, Literal, cast
from typing_extensions import NotRequired
import pprint

import baml_py
from pydantic import BaseModel, ValidationError, create_model

from . import partial_types, types
from .types import Checked, Check
from .type_builder import TypeBuilder
from .globals import DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_CTX, DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME

OutputType = TypeVar('OutputType')

# Define the TypedDict with optional parameters having default values
class BamlCallOptions(TypedDict, total=False):
    tb: NotRequired[TypeBuilder]
    client_registry: NotRequired[baml_py.baml_py.ClientRegistry]

class BamlSyncClient:
    __runtime: baml_py.BamlRuntime
    __ctx_manager: baml_py.BamlCtxManager
    __stream_client: "BamlStreamClient"

    def __init__(self, runtime: baml_py.BamlRuntime, ctx_manager: baml_py.BamlCtxManager):
      self.__runtime = runtime
      self.__ctx_manager = ctx_manager
      self.__stream_client = BamlStreamClient(self.__runtime, self.__ctx_manager)

    @property
    def stream(self):
      return self.__stream_client

    
    def AnalyzeProductReview(
        self,
        text: str,
        baml_options: BamlCallOptions = {},
    ) -> types.ProductAnalysis:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      raw = self.__runtime.call_function_sync(
        "AnalyzeProductReview",
        {
          "text": text,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
      )
      return cast(types.ProductAnalysis, raw.cast_to(types, types, partial_types, False))
    
    def CompareAnalysis(
        self,
        analysis1: str,analysis2: str,
        baml_options: BamlCallOptions = {},
    ) -> types.ProductComparison:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      raw = self.__runtime.call_function_sync(
        "CompareAnalysis",
        {
          "analysis1": analysis1,"analysis2": analysis2,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
      )
      return cast(types.ProductComparison, raw.cast_to(types, types, partial_types, False))
    



class BamlStreamClient:
    __runtime: baml_py.BamlRuntime
    __ctx_manager: baml_py.BamlCtxManager

    def __init__(self, runtime: baml_py.BamlRuntime, ctx_manager: baml_py.BamlCtxManager):
      self.__runtime = runtime
      self.__ctx_manager = ctx_manager

    
    def AnalyzeProductReview(
        self,
        text: str,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.BamlSyncStream[partial_types.ProductAnalysis, types.ProductAnalysis]:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      raw = self.__runtime.stream_function_sync(
        "AnalyzeProductReview",
        {
          "text": text,
        },
        None,
        self.__ctx_manager.get(),
        tb,
        __cr__,
      )

      return baml_py.BamlSyncStream[partial_types.ProductAnalysis, types.ProductAnalysis](
        raw,
        lambda x: cast(partial_types.ProductAnalysis, x.cast_to(types, types, partial_types, True)),
        lambda x: cast(types.ProductAnalysis, x.cast_to(types, types, partial_types, False)),
        self.__ctx_manager.get(),
      )
    
    def CompareAnalysis(
        self,
        analysis1: str,analysis2: str,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.BamlSyncStream[partial_types.ProductComparison, types.ProductComparison]:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      raw = self.__runtime.stream_function_sync(
        "CompareAnalysis",
        {
          "analysis1": analysis1,
          "analysis2": analysis2,
        },
        None,
        self.__ctx_manager.get(),
        tb,
        __cr__,
      )

      return baml_py.BamlSyncStream[partial_types.ProductComparison, types.ProductComparison](
        raw,
        lambda x: cast(partial_types.ProductComparison, x.cast_to(types, types, partial_types, True)),
        lambda x: cast(types.ProductComparison, x.cast_to(types, types, partial_types, False)),
        self.__ctx_manager.get(),
      )
    

b = BamlSyncClient(DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME, DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_CTX)

__all__ = ["b"]