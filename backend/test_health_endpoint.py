"""
Test script to verify the new health check endpoint for monitors
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    """Test the new POST /monitors/{id}/check endpoint"""
    # First create a monitor to test
    monitor_data = {
        "name": "Test API",
        "url": "https://httpbin.org/status/200",
        "interval_seconds": 300
    }
    response = client.post("/monitors/", json=monitor_data)
    assert response.status_code == 201
    monitor = response.json()
    monitor_id = monitor["id"]
    print(f"Created monitor with ID: {monitor_id}")
    
    # Test the health check endpoint
    response = client.post(f"/monitors/{monitor_id}/check")
    assert response.status_code == 200
    result = response.json()
    print(f"Health check result: {result}")
    
    # Verify the response has expected fields
    assert "status_code" in result
    assert "response_time" in result
    assert "error" in result
    assert result["status_code"] == 200
    assert result["error"] is None
    assert isinstance(result["response_time"], float)
    assert result["response_time"] >= 0
    
    print("✓ Health check endpoint works correctly")
    
    # Test with non-existent monitor
    response = client.post("/monitors/99999/check")
    assert response.status_code == 404
    assert response.json()["detail"] == "Monitor not found"
    print("✓ Health check endpoint correctly handles non-existent monitor")
    
    # Clean up
    client.delete(f"/monitors/{monitor_id}")
    print("✓ Test cleanup completed")

if __name__ == "__main__":
    print("Testing health check endpoint for monitors...")
    try:
        test_health_check_endpoint()
        print("\n🎉 All tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise