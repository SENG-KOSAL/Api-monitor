"""
Test script to verify CRUD endpoints for monitors
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "API Monitor is running"
    print("✓ Root endpoint works")

def test_health_endpoint():
    """Test the health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    print("✓ Health endpoint works")

def test_create_monitor():
    """Test creating a monitor"""
    monitor_data = {
        "name": "MyHR API",
        "url": "https://api.example.com/health",
        "interval_seconds": 300
    }
    response = client.post("/monitors/", json=monitor_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "MyHR API"
    assert data["url"] == "https://api.example.com/health"
    assert data["interval_seconds"] == 300
    assert data["is_active"] == True
    assert data["auth_type"] == "none"
    assert data["auth_token"] is None
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data
    print("✓ Create monitor works")
    return data["id"]

def test_get_monitors():
    """Test getting all monitors"""
    response = client.get("/monitors/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should have at least the monitor we created
    assert len(data) >= 1
    print("✓ Get monitors works")

def test_get_specific_monitor(monitor_id):
    """Test getting a specific monitor"""
    response = client.get(f"/monitors/{monitor_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == monitor_id
    assert data["name"] == "MyHR API"
    print("✓ Get specific monitor works")

def test_update_monitor(monitor_id):
    """Test updating a monitor"""
    update_data = {
        "name": "Updated MyHR API",
        "interval_seconds": 600,
        "auth_type": "bearer",
        "auth_token": "token-12345"
    }
    response = client.put(f"/monitors/{monitor_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated MyHR API"
    assert data["interval_seconds"] == 600
    assert data["url"] == "https://api.example.com/health"  # Unchanged
    assert data["auth_type"] == "bearer"
    assert data["auth_token"] == "token-12345"

    # Switch back to none
    response = client.put(f"/monitors/{monitor_id}", json={"auth_type": "none"})
    assert response.status_code == 200
    data = response.json()
    assert data["auth_type"] == "none"
    assert data["auth_token"] is None
    print("✓ Update monitor works")

def test_delete_monitor(monitor_id):
    """Test deleting a monitor"""
    response = client.delete(f"/monitors/{monitor_id}")
    assert response.status_code == 204
    
    # Verify it's deleted
    response = client.get(f"/monitors/{monitor_id}")
    assert response.status_code == 404
    print("✓ Delete monitor works")

if __name__ == "__main__":
    print("Testing CRUD endpoints for monitors...")
    try:
        test_root_endpoint()
        test_health_endpoint()
        
        # Test CRUD operations
        monitor_id = test_create_monitor()
        test_get_monitors()
        test_get_specific_monitor(monitor_id)
        test_update_monitor(monitor_id)
        test_delete_monitor(monitor_id)
        
        print("\n🎉 All tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise