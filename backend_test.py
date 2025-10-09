#!/usr/bin/env python3
"""
Backend API Test Suite for The Real Johnson Handyman Services
Tests all core API endpoints including authentication, services, and quotes.
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://fixitright-2.preview.emergentagent.com/api"
TEST_USER_EMAIL = "john.customer@example.com"
TEST_USER_PASSWORD = "SecurePass123!"
TEST_USER_NAME = "John Customer"
TEST_USER_PHONE = "+1234567890"

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.access_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> requests.Response:
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if self.access_token:
            default_headers["Authorization"] = f"Bearer {self.access_token}"
            
        if headers:
            default_headers.update(headers)
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=default_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise
    
    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n=== Testing Health Endpoints ===")
        
        # Test root endpoint
        try:
            response = self.make_request("GET", "/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    self.log_test("Root Health Check", True, f"API running version {data.get('version')}")
                else:
                    self.log_test("Root Health Check", False, "Missing expected fields in response")
            else:
                self.log_test("Root Health Check", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Root Health Check", False, f"Exception: {str(e)}")
        
        # Test detailed health endpoint
        try:
            response = self.make_request("GET", "/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Detailed Health Check", True, f"Database: {data.get('database')}, AI: {data.get('ai_provider')}")
                else:
                    self.log_test("Detailed Health Check", False, f"Status not healthy: {data.get('status')}")
            else:
                self.log_test("Detailed Health Check", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Detailed Health Check", False, f"Exception: {str(e)}")
    
    def test_user_registration(self):
        """Test user registration"""
        print("\n=== Testing User Registration ===")
        
        # Generate unique email for testing
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        registration_data = {
            "email": unique_email,
            "password": TEST_USER_PASSWORD,
            "full_name": TEST_USER_NAME,
            "phone": TEST_USER_PHONE,
            "role": "customer"
        }
        
        try:
            response = self.make_request("POST", "/auth/register", registration_data)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "refresh_token" in data:
                    self.access_token = data["access_token"]
                    self.log_test("User Registration", True, f"User registered successfully with email: {unique_email}")
                    # Store for login test
                    self.test_email = unique_email
                    return True
                else:
                    self.log_test("User Registration", False, "Missing tokens in response")
            else:
                self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Registration", False, f"Exception: {str(e)}")
        
        return False
    
    def test_user_login(self):
        """Test user login"""
        print("\n=== Testing User Login ===")
        
        if not hasattr(self, 'test_email'):
            self.log_test("User Login", False, "No test email available (registration may have failed)")
            return False
        
        login_data = {
            "email": self.test_email,
            "password": TEST_USER_PASSWORD
        }
        
        try:
            response = self.make_request("POST", "/auth/login", login_data)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "refresh_token" in data:
                    self.access_token = data["access_token"]
                    self.log_test("User Login", True, "Login successful, tokens received")
                    return True
                else:
                    self.log_test("User Login", False, "Missing tokens in response")
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_current_user(self):
        """Test getting current user info"""
        print("\n=== Testing Get Current User ===")
        
        if not self.access_token:
            self.log_test("Get Current User", False, "No access token available")
            return
        
        try:
            response = self.make_request("GET", "/auth/me")
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "email" in data:
                    self.user_id = data["id"]
                    self.log_test("Get Current User", True, f"User info retrieved: {data.get('full_name')} ({data.get('email')})")
                else:
                    self.log_test("Get Current User", False, "Missing expected user fields")
            else:
                self.log_test("Get Current User", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Current User", False, f"Exception: {str(e)}")
    
    def test_service_catalog(self):
        """Test service catalog endpoints"""
        print("\n=== Testing Service Catalog ===")
        
        # Test get all services
        try:
            response = self.make_request("GET", "/services")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("Get All Services", True, f"Retrieved {len(data)} services")
                    # Store first service for detailed test
                    self.test_service_id = data[0].get("id")
                    
                    # Test service categories
                    categories = set(service.get("category") for service in data)
                    self.log_test("Service Categories", True, f"Found categories: {', '.join(categories)}")
                else:
                    self.log_test("Get All Services", False, "No services found or invalid response format")
            else:
                self.log_test("Get All Services", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get All Services", False, f"Exception: {str(e)}")
        
        # Test get specific service
        if hasattr(self, 'test_service_id') and self.test_service_id:
            try:
                response = self.make_request("GET", f"/services/{self.test_service_id}")
                if response.status_code == 200:
                    data = response.json()
                    if "id" in data and "title" in data:
                        self.log_test("Get Specific Service", True, f"Service details: {data.get('title')}")
                    else:
                        self.log_test("Get Specific Service", False, "Missing expected service fields")
                else:
                    self.log_test("Get Specific Service", False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("Get Specific Service", False, f"Exception: {str(e)}")
    
    def test_quote_request(self):
        """Test quote request system with AI integration"""
        print("\n=== Testing Quote Request System ===")
        
        if not self.access_token:
            self.log_test("Quote Request", False, "No access token available")
            return
        
        # First add an address for the quote
        address_data = {
            "id": str(uuid.uuid4()),
            "street": "123 Main Street",
            "city": "Springfield",
            "state": "IL",
            "zip_code": "62701",
            "is_primary": True
        }
        
        try:
            response = self.make_request("POST", "/profile/addresses", address_data)
            if response.status_code == 200:
                self.log_test("Add Address", True, "Address added successfully")
                address_id = address_data["id"]
            else:
                self.log_test("Add Address", False, f"HTTP {response.status_code}: {response.text}")
                address_id = str(uuid.uuid4())  # Use dummy ID
        except Exception as e:
            self.log_test("Add Address", False, f"Exception: {str(e)}")
            address_id = str(uuid.uuid4())  # Use dummy ID
        
        # Create quote request
        quote_data = {
            "service_category": "drywall",
            "description": "Need to patch several holes in living room wall from picture hanging",
            "address_id": address_id,
            "photos": [],
            "preferred_dates": [
                (datetime.now() + timedelta(days=3)).isoformat(),
                (datetime.now() + timedelta(days=5)).isoformat()
            ],
            "budget_range": "100-300",
            "urgency": "normal"
        }
        
        try:
            response = self.make_request("POST", "/quotes/request", quote_data)
            if response.status_code == 200:
                data = response.json()
                if "quote_id" in data and "estimated_total" in data:
                    self.quote_id = data["quote_id"]
                    ai_suggested = data.get("ai_suggested", False)
                    self.log_test("Quote Request", True, 
                                f"Quote created: ${data['estimated_total']:.2f}, AI suggested: {ai_suggested}")
                else:
                    self.log_test("Quote Request", False, "Missing expected quote fields")
            else:
                self.log_test("Quote Request", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Quote Request", False, f"Exception: {str(e)}")
    
    def test_quote_management(self):
        """Test quote management endpoints"""
        print("\n=== Testing Quote Management ===")
        
        if not self.access_token:
            self.log_test("Quote Management", False, "No access token available")
            return
        
        # Test get user quotes
        try:
            response = self.make_request("GET", "/quotes")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get User Quotes", True, f"Retrieved {len(data)} quotes")
                    
                    # Test get specific quote if we have one
                    if hasattr(self, 'quote_id') and self.quote_id:
                        try:
                            response = self.make_request("GET", f"/quotes/{self.quote_id}")
                            if response.status_code == 200:
                                quote_data = response.json()
                                if "id" in quote_data and "total_amount" in quote_data:
                                    self.log_test("Get Specific Quote", True, 
                                                f"Quote details: ${quote_data['total_amount']:.2f}")
                                else:
                                    self.log_test("Get Specific Quote", False, "Missing expected quote fields")
                            else:
                                self.log_test("Get Specific Quote", False, f"HTTP {response.status_code}: {response.text}")
                        except Exception as e:
                            self.log_test("Get Specific Quote", False, f"Exception: {str(e)}")
                else:
                    self.log_test("Get User Quotes", False, "Invalid response format")
            else:
                self.log_test("Get User Quotes", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get User Quotes", False, f"Exception: {str(e)}")
    
    def test_authentication_protection(self):
        """Test that protected endpoints require authentication"""
        print("\n=== Testing Authentication Protection ===")
        
        # Temporarily remove token
        original_token = self.access_token
        self.access_token = None
        
        # Test protected endpoints without token
        protected_endpoints = [
            ("GET", "/auth/me"),
            ("GET", "/quotes"),
            ("POST", "/quotes/request")
        ]
        
        for method, endpoint in protected_endpoints:
            try:
                test_data = {"test": "data"} if method == "POST" else None
                response = self.make_request(method, endpoint, test_data)
                if response.status_code == 401:
                    self.log_test(f"Auth Protection {method} {endpoint}", True, "Correctly rejected unauthorized request")
                else:
                    self.log_test(f"Auth Protection {method} {endpoint}", False, 
                                f"Expected 401, got {response.status_code}")
            except Exception as e:
                self.log_test(f"Auth Protection {method} {endpoint}", False, f"Exception: {str(e)}")
        
        # Restore token
        self.access_token = original_token
    
    def test_error_handling(self):
        """Test error handling and validation"""
        print("\n=== Testing Error Handling ===")
        
        # Test invalid registration data
        invalid_registration = {
            "email": "invalid-email",
            "password": "123",  # Too short
            "full_name": "",
            "phone": "invalid"
        }
        
        try:
            response = self.make_request("POST", "/auth/register", invalid_registration)
            if response.status_code >= 400:
                self.log_test("Invalid Registration Data", True, f"Correctly rejected invalid data: {response.status_code}")
            else:
                self.log_test("Invalid Registration Data", False, "Should have rejected invalid registration data")
        except Exception as e:
            self.log_test("Invalid Registration Data", False, f"Exception: {str(e)}")
        
        # Test invalid login
        invalid_login = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        try:
            response = self.make_request("POST", "/auth/login", invalid_login)
            if response.status_code == 401:
                self.log_test("Invalid Login", True, "Correctly rejected invalid credentials")
            else:
                self.log_test("Invalid Login", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("Invalid Login", False, f"Exception: {str(e)}")
        
        # Test nonexistent service
        try:
            response = self.make_request("GET", "/services/nonexistent-id")
            if response.status_code == 404:
                self.log_test("Nonexistent Service", True, "Correctly returned 404 for nonexistent service")
            else:
                self.log_test("Nonexistent Service", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Nonexistent Service", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Test Suite for The Real Johnson Handyman Services")
        print(f"Testing against: {self.base_url}")
        print("=" * 80)
        
        # Run tests in logical order
        self.test_health_endpoints()
        self.test_service_catalog()
        
        # Authentication flow
        if self.test_user_registration():
            self.test_user_login()
            self.test_get_current_user()
            
            # Protected endpoints (require auth)
            self.test_quote_request()
            self.test_quote_management()
        
        # Security and error handling
        self.test_authentication_protection()
        self.test_error_handling()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("🏁 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['details']}")
        
        print("\n" + "=" * 80)
        
        return passed, failed

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()