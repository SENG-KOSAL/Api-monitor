"""
Test script to verify Bearer Token and Basic Auth authentication for monitors
"""
from fastapi.testclient import TestClient
from app.main import app
from app.services.health_checker import build_auth_headers, check_health

client = TestClient(app)

def test_build_auth_headers():
    # Bearer tests
    assert build_auth_headers("none", None) == {}
    assert build_auth_headers("none", "some_token") == {}
    assert build_auth_headers("bearer", None) == {}
    assert build_auth_headers("bearer", "") == {}
    assert build_auth_headers("bearer", "   ") == {}
    assert build_auth_headers("bearer", "secret123") == {"Authorization": "Bearer secret123"}
    assert build_auth_headers("bearer", "  secret123  ") == {"Authorization": "Bearer secret123"}

    # Basic auth tests
    assert build_auth_headers("basic", None, None, None) == {}
    assert build_auth_headers("basic", None, "", "pass") == {}
    assert build_auth_headers("basic", None, "user", "") == {}
    assert build_auth_headers("basic", None, "   ", "pass") == {}
    assert build_auth_headers("basic", None, "user", "   ") == {}
    # Base64 of "user:pass" is "dXNlcjpwYXNz"
    assert build_auth_headers("basic", None, "user", "pass") == {"Authorization": "Basic dXNlcjpwYXNz"}
    assert build_auth_headers("basic", None, "  user  ", "  pass  ") == {"Authorization": "Basic dXNlcjpwYXNz"}
    # When auth_type is not basic, username/password are ignored
    assert build_auth_headers("none", None, "user", "pass") == {}

    print("✓ build_auth_headers unit tests passed")

def test_create_and_update_bearer_monitor():
    # 1. Create a monitor with Bearer Token auth
    monitor_data = {
        "name": "Auth Test API - Bearer",
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
    assert data["auth_username"] is None
    assert data["auth_password"] is None
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
    assert updated["auth_username"] is None
    assert updated["auth_password"] is None
    print("✓ Switching auth_type to 'none' clears auth_token")

    # 4. Clean up
    del_res = client.delete(f"/monitors/{monitor_id}")
    assert del_res.status_code == 204
    print("✓ Cleanup completed")

def test_create_and_update_basic_monitor():
    # 1. Create a monitor with Basic Auth
    monitor_data = {
        "name": "Auth Test API - Basic",
        "url": "https://httpbin.org/basic-auth/testuser/testpass",
        "interval_seconds": 300,
        "auth_type": "basic",
        "auth_username": "testuser",
        "auth_password": "testpass"
    }
    response = client.post("/monitors/", json=monitor_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["auth_type"] == "basic"
    assert data["auth_username"] == "testuser"
    assert data["auth_password"] == "testpass"
    assert data["auth_token"] is None
    monitor_id = data["id"]
    print("✓ Created monitor with Basic Auth")

    # 2. Check health with Basic Auth against httpbin.org/basic-auth/testuser/testpass
    check_response = client.post(f"/monitors/{monitor_id}/check")
    assert check_response.status_code == 200, check_response.text
    check_result = check_response.json()
    print(f"Basic auth check status code: {check_result['status_code']}")
    assert check_result["status_code"] == 200
    print("✓ Health check successfully passed with Basic Auth")

    # 3. Update monitor to switch to Bearer Auth
    update_data = {
        "auth_type": "bearer",
        "auth_token": "switched-to-bearer-token"
    }
    update_response = client.put(f"/monitors/{monitor_id}", json=update_data)
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["auth_type"] == "bearer"
    assert updated["auth_token"] == "switched-to-bearer-token"
    assert updated["auth_username"] is None
    assert updated["auth_password"] is None
    print("✓ Switching auth_type from 'basic' to 'bearer' clears username and password")

    # 4. Update monitor to switch back to Basic Auth
    update_basic = {
        "auth_type": "basic",
        "auth_username": "newuser",
        "auth_password": "newpassword"
    }
    update_basic_resp = client.put(f"/monitors/{monitor_id}", json=update_basic)
    assert update_basic_resp.status_code == 200
    updated = update_basic_resp.json()
    assert updated["auth_type"] == "basic"
    assert updated["auth_username"] == "newuser"
    assert updated["auth_password"] == "newpassword"
    assert updated["auth_token"] is None
    print("✓ Switching auth_type back to 'basic' clears bearer token")

    # 5. Validation test: creating basic auth without password should fail
    invalid_data = {
        "name": "Invalid Basic Monitor",
        "url": "https://httpbin.org/get",
        "auth_type": "basic",
        "auth_username": "testuser"
    }
    invalid_resp = client.post("/monitors/", json=invalid_data)
    assert invalid_resp.status_code == 422
    print("✓ Validation prevents creating basic auth without password")

    # 6. Clean up
    del_res = client.delete(f"/monitors/{monitor_id}")
    assert del_res.status_code == 204
    print("✓ Basic auth cleanup completed")

if __name__ == "__main__":
    print("Testing Authentication functionality (Bearer & Basic)...")
    test_build_auth_headers()
    test_create_and_update_bearer_monitor()
    test_create_and_update_basic_monitor()
    print("\n🎉 All Bearer and Basic Auth tests passed successfully!")
