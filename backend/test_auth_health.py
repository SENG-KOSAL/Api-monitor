"""
Test script to verify Bearer Token authentication for monitors
"""
from fastapi.testclient import TestClient
from app.main import app
from app.services.health_checker import build_auth_headers, check_health

client = TestClient(app)

def test_build_auth_headers():
    assert build_auth_headers("none", None) == {}
    assert build_auth_headers("none", "some_token") == {}
    assert build_auth_headers("bearer", None) == {}
    assert build_auth_headers("bearer", "") == {}
    assert build_auth_headers("bearer", "   ") == {}
    assert build_auth_headers("bearer", "secret123") == {"Authorization": "Bearer secret123"}
    assert build_auth_headers("bearer", "  secret123  ") == {"Authorization": "Bearer secret123"}
    print("✓ build_auth_headers unit tests passed")

def test_create_and_update_bearer_monitor():
    # 1. Create a monitor with Bearer Token auth
    monitor_data = {
        "name": "Auth Test API",
        "url": "https://httpbin.org/bearer",
        "interval_seconds": 300,
        "auth_type": "bearer",
        "auth_token": "my-secret-token"
    }
    response = client.post("/monitors/", json=monitor_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["auth_type"] == "bearer"
    assert data["auth_token"] == "my-secret-token"
    monitor_id = data["id"]
    print("✓ Created monitor with Bearer Token")

    # 2. Check health with Bearer Token against httpbin.org/bearer
    # httpbin.org/bearer returns 200 if Bearer token is provided!
    check_response = client.post(f"/monitors/{monitor_id}/check")
    assert check_response.status_code == 200, check_response.text
    check_result = check_response.json()
    print(f"Auth check status code: {check_result['status_code']}")
    # httpbin.org/bearer returns 200 with valid bearer token header
    assert check_result["status_code"] == 200
    print("✓ Health check successfully passed with Bearer Token")

    # 3. Update monitor to Public (None)
    update_data = {
        "auth_type": "none"
    }
    update_response = client.put(f"/monitors/{monitor_id}", json=update_data)
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["auth_type"] == "none"
    assert updated["auth_token"] is None
    print("✓ Switching auth_type to 'none' clears auth_token")

    # 4. Clean up
    del_res = client.delete(f"/monitors/{monitor_id}")
    assert del_res.status_code == 204
    print("✓ Cleanup completed")

if __name__ == "__main__":
    print("Testing Bearer Token authentication functionality...")
    test_build_auth_headers()
    test_create_and_update_bearer_monitor()
    print("\n🎉 All Bearer Token auth tests passed successfully!")
