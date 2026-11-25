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
            try:
                db.session.execute(db.text("ALTER TABLE accounts_studentprofile ADD COLUMN duration VARCHAR(60) DEFAULT '15 Days Internship Program'"))
                db.session.commit()
            except Exception:
                db.session.rollback()
            try:
                db.session.execute(db.text("ALTER TABLE internships_internship ADD COLUMN duration VARCHAR(60) DEFAULT '15 Days Internship Program'"))
                db.session.commit()
            except Exception:
                db.session.rollback()

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

    def test_10_duration_title_and_display_formatters(self):
        """QA Test: All 5 duration options format accurately in title and table"""
        from services.appointment_letter import format_program_selection_title, format_duration_display
        test_cases = [
            ("15 Days Internship Program", "15-Day Offline Internship Program", "15 Days Internship Program"),
            ("1 Month Internship Program", "1-Month Offline Internship Program", "1 Month Internship Program"),
            ("2 Months Internship Program", "2-Month Offline Internship Program", "2 Months Internship Program"),
            ("3 Months Internship Program", "3-Month Offline Internship Program", "3 Months Internship Program"),
            ("6 Months Internship Program", "6-Month Offline Internship Program", "6 Months Internship Program"),
        ]
        for input_val, expected_title, expected_display in test_cases:
            title = format_program_selection_title(input_val, mode="Offline")
            display = format_duration_display(input_val)
            self.assertEqual(title, expected_title)
            self.assertEqual(display, expected_display)

            online_title = format_program_selection_title(input_val, mode="Online")
            self.assertIn("Online", online_title)

    def test_11_appointment_letter_pdf_rendering(self):
        """QA Test: Appointment letter PDF renders cleanly with chosen duration"""
        from services.appointment_letter import render_appointment_letter_pdf
        for dur in ["15 Days Internship Program", "1 Month Internship Program", "6 Months Internship Program"]:
            data = {
                "name": "QA Karthipan",
                "email": "karthipan@test.com",
                "register_number": "877667",
                "project_name": "Prompt Engineering",
                "internship_mode": "Offline",
                "duration": dur,
                "branch": "100ft",
                "reporting_time": "11:00 AM",
                "start_date": "2026-11-24",
                "password": "Password123!",
            }
            pdf_bytes = render_appointment_letter_pdf(data)
            self.assertTrue(isinstance(pdf_bytes, bytes))
            self.assertTrue(len(pdf_bytes) > 20000)
            self.assertTrue(pdf_bytes.startswith(b"%PDF"))

    def test_12_email_appointment_letter_templates(self):
        """QA Test: HTML and Plain text emails render chosen duration dynamically and include Tatabad address"""
        from services.email_service import build_appointment_letter_html, build_appointment_letter_plain
        data = {
            "name": "QA Student",
            "email": "qastudent@test.com",
            "project_name": "Data Analytics",
            "duration": "1 Month Internship Program",
            "internship_mode": "Offline",
            "start_date": "2026-11-25",
            "reporting_time": "11:00 AM",
            "branch": "100ft",
            "password": "TempPassword123!",
        }
        html = build_appointment_letter_html(data)
        plain = build_appointment_letter_plain(data)

        self.assertIn("1-Month Offline Internship Program", html)
        self.assertIn("1 Month Internship Program", html)
        self.assertIn("1-Month Offline Internship Program", plain)
        self.assertIn("1 Month Internship Program", plain)
        self.assertIn("Tatabad", html)
        self.assertIn("Tatabad", plain)

    def test_13_office_address_tatabad_consistency(self):
        """QA Test: Tatabad office address is set across appointment letter and email venue maps"""
        from services.appointment_letter import VENUE_MAP as AL_VENUE_MAP
        from services.email_service import VENUE_MAP as EM_VENUE_MAP
        expected = "2nd Floor, SS Complex, 64/1, 7th Street, Tatabad, Coimbatore, Tamil Nadu 641012"
        self.assertEqual(AL_VENUE_MAP["100ft"], expected)
        self.assertEqual(EM_VENUE_MAP["100ft"], expected)

    def test_14_registration_with_duration_and_approval_workflow(self):
        """QA Test: Registration with duration persists to DB and approval workflow succeeds"""
        test_email = "qa_automated_worker@wingrootech.com"
        reg_payload = {
            "full_name": "QA Worker",
            "email": test_email,
            "password": "QAPassword123!",
            "confirm_password": "QAPassword123!",
            "mobile_number": "9876543210",
            "candidate_type": "COLLEGE_INTERN",
            "college_name": "Government College of Technology",
            "department": "IT",
            "course": "B.Tech",
            "project_name": "Artificial Intelligence and Machine Learning",
            "duration": "3 Months Internship Program",
            "branch": "100ft",
            "reporting_time": "11:00 AM",
            "internship_mode": "Offline",
            "gender": "MALE",
        }

        with self.app.app_context():
            u = User.query.filter_by(email=test_email).first()
            if u:
                db.session.delete(u)
                db.session.commit()

        res = self.client.post("/api/auth/register/", json=reg_payload)
        self.assertEqual(res.status_code, 201)
        access_token = res.get_json().get("access")

        headers = {"Authorization": f"Bearer {access_token}"}
        prof_res = self.client.get("/api/student/profile/", headers=headers)
        self.assertEqual(prof_res.status_code, 200)
        prof_data = prof_res.get_json()
        self.assertEqual(prof_data.get("duration"), "3 Months Internship Program")
        self.assertEqual(prof_data.get("full_name"), "QA Worker")

        # Blocked before approval
        appt_before = self.client.get("/api/student/appointment-letter/", headers=headers)
        self.assertEqual(appt_before.status_code, 403)

        # Admin approve
        user_id = prof_data["id"]
        admin_headers = {"Authorization": "Bearer wingroo-admin-session-token"}
        appr_res = self.client.post(f"/api/admin/students/{user_id}/approve/", headers=admin_headers)
        self.assertEqual(appr_res.status_code, 200)

        # Unlocked after approval
        appt_after = self.client.get("/api/student/appointment-letter/", headers=headers)
        self.assertEqual(appt_after.status_code, 200)
        self.assertEqual(appt_after.content_type, "application/pdf")

        # Cleanup
        with self.app.app_context():
            u = User.query.get(user_id)
            if u:
                db.session.delete(u)
                db.session.commit()


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(BackendQATestCase)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
