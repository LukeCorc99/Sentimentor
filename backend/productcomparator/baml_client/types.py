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
from typing import Dict, Generic, List, Literal, Optional, TypeVar, Union


T = TypeVar('T')
CheckName = TypeVar('CheckName', bound=str)

class Check(BaseModel):
    name: str
    expression: str
    status: str

class Checked(BaseModel, Generic[T,CheckName]):
    value: T
    checks: Dict[CheckName, Check]

def get_checks(checks: Dict[CheckName, Check]) -> List[Check]:
    return list(checks.values())

def all_succeeded(checks: Dict[CheckName, Check]) -> bool:
    return all(check.status == "succeeded" for check in get_checks(checks))



class ProductAnalysis(BaseModel):
    name: str
    summary: str
    price: str
    priceSource: str
    specifications: List[str]
    valueForMoney: str
    soundQuality: str
    comfortFit: str
    batteryLife: str
    connectivity: str
    featuresControls: str
    callQuality: str
    brandWarranty: str
    userFeedback: str
    availability: str
    sentimentRating: float
    sentiment: str

class ProductComparison(BaseModel):
    name1: str
    name2: str
    summary: str
    price1: str
    priceSource1: str
    price2: str
    priceSource2: str
    specifications1: List[str]
    specifications2: List[str]
    score1: str
    score2: str
    sentiment1: str
    sentiment2: str
    valueForMoneyComparison: str
    soundQualityComparison: str
    comfortFitComparison: str
    batteryLifeComparison: str
    connectivityComparison: str
    featuresControlsComparison: str
    callQualityComparison: str
    brandWarrantyComparison: str
    userFeedbackComparison: str
    availabilityComparison: str
    overallSentimentComparison: str
    recommendation: str
