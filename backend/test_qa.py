"""
Automated QA Test Suite for Wingroo Technologies Backend
Can be run via:
    python test_qa.py
or:
    pytest test_qa.py
"""

import os
import sys
import unittest

# If DATABASE_URL is not provided, use a clean SQLite database for isolated QA testing
if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "sqlite:///qa_test_isolated.db"

from app import create_app
from models import db, User, StudentProfile, Internship, Certificate
from services.captcha import make_captcha, validate_captcha
from services.storage import save_base64_file


class BackendQATestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config["TESTING"] = True
        cls.client = cls.app.test_client()
        with cls.app.app_context():
            db.create_all()

    def test_01_health_check(self):
        """QA Test: /api/health must return 200 and healthy status"""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsNotNone(data)
        self.assertEqual(data.get("status"), "healthy")

    def test_02_projects_api(self):
        """QA Test: /api/projects endpoint must return active projects"""
        response = self.client.get("/api/projects")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get("success", False))
        self.assertIn("projects", data)
        self.assertIsInstance(data["projects"], list)

    def test_03_college_internships_api(self):
        """QA Test: /api/college-internships endpoint must return 200"""
        response = self.client.get("/api/college-internships")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, (dict, list))

    def test_04_events_api(self):
        """QA Test: /api/events endpoint must return 200"""
        response = self.client.get("/api/events")
        self.assertEqual(response.status_code, 200)

    def test_05_captcha_generation(self):
        """QA Test: /api/public/captcha/ must return a 6-digit challenge"""
        response = self.client.get("/api/public/captcha/")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("token", data)
        self.assertTrue("otp" in data or "question" in data)

    def test_06_captcha_validation(self):
        """QA Test: Captcha validation logic works correctly"""
        with self.app.app_context():
            cap = make_captcha()
            otp = cap.get("otp") or cap.get("question")
            token = cap.get("token")
            self.assertTrue(validate_captcha(token, otp))
            self.assertFalse(validate_captcha(token, "000000_wrong"))
            self.assertFalse(validate_captcha(None, None))

    def test_07_certificate_verification_endpoints(self):
        """QA Test: Public certificate verification endpoints are accessible"""
        # Test invalid token with bad captcha returns 400
        res1 = self.client.get("/api/public/verify/token/test-token-123/")
        self.assertEqual(res1.status_code, 400)

        # Test route alias without /api/
        res2 = self.client.get("/public/verify/token/test-token-123/")
        self.assertEqual(res2.status_code, 400)

    def test_08_models_metadata(self):
        """QA Test: Core SQLAlchemy tables exist in metadata"""
        table_names = db.metadata.tables.keys()
        self.assertIn("accounts_user", table_names)
        self.assertIn("accounts_studentprofile", table_names)
        self.assertIn("internships_internship", table_names)
        self.assertIn("certificates_certificate", table_names)

    def test_09_storage_service(self):
        """QA Test: Base64 storage handles edge cases safely"""
        self.assertIsNone(save_base64_file(None, "uploads"))
        self.assertIsNone(save_base64_file("", "uploads"))
        self.assertEqual(save_base64_file("already_saved_path.jpg", "uploads"), "already_saved_path.jpg")


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(BackendQATestCase)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
