import pytest
from flask import json

@pytest.fixture


def test_cameras_route(client):
    """Test the /cameras route."""
    response = client.get('/cameras')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_televisions_route(client):
    """Test the /televisions route."""
    response = client.get('/televisions')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
