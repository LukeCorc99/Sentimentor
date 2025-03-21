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
import baml_py
from enum import Enum
from pydantic import BaseModel, ConfigDict
from typing_extensions import TypeAlias
from typing import Dict, Generic, List, Optional, TypeVar, Union, Literal

from . import types
from .types import Checked, Check

###############################################################################
#
#  These types are used for streaming, for when an instance of a type
#  is still being built up and any of its fields is not yet fully available.
#
###############################################################################

T = TypeVar('T')
class StreamState(BaseModel, Generic[T]):
    value: T
    state: Literal["Pending", "Incomplete", "Complete"]


class ProductAnalysis(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None
    price: Optional[str] = None
    priceSource: Optional[str] = None
    specifications: List[str]
    valueForMoney: Optional[str] = None
    soundQuality: Optional[str] = None
    comfortFit: Optional[str] = None
    batteryLife: Optional[str] = None
    connectivity: Optional[str] = None
    featuresControls: Optional[str] = None
    callQuality: Optional[str] = None
    brandWarranty: Optional[str] = None
    userFeedback: Optional[str] = None
    availability: Optional[str] = None
    sentimentRating: Optional[float] = None
    sentiment: Optional[str] = None

class ProductComparison(BaseModel):
    name1: Optional[str] = None
    name2: Optional[str] = None
    summary: Optional[str] = None
    price1: Optional[str] = None
    priceSource1: Optional[str] = None
    price2: Optional[str] = None
    priceSource2: Optional[str] = None
    specifications1: List[str]
    specifications2: List[str]
    score1: Optional[str] = None
    score2: Optional[str] = None
    sentiment1: Optional[str] = None
    sentiment2: Optional[str] = None
    valueForMoneyComparison: Optional[str] = None
    soundQualityComparison: Optional[str] = None
    comfortFitComparison: Optional[str] = None
    batteryLifeComparison: Optional[str] = None
    connectivityComparison: Optional[str] = None
    featuresControlsComparison: Optional[str] = None
    callQualityComparison: Optional[str] = None
    brandWarrantyComparison: Optional[str] = None
    userFeedbackComparison: Optional[str] = None
    availabilityComparison: Optional[str] = None
    overallSentimentComparison: Optional[str] = None
    recommendation: Optional[str] = None
