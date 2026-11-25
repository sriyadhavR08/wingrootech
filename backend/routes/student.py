from datetime import date
from flask import Blueprint, jsonify, g, request, current_app, make_response
from models import db, User, StudentProfile, Internship
from services.auth import student_required, student_data, certificate_data
from services.storage import save_base64_file

student_bp = Blueprint("student", __name__)


@student_bp.route("/api/student/profile/", methods=["GET", "PUT", "PATCH"])
@student_bp.route("/api/student/profile", methods=["GET", "PUT", "PATCH"])
@student_required
def profile():
    host_url = request.host_url.rstrip("/")
    user = g.current_user

    if request.method in ["PUT", "PATCH"]:
        data = request.get_json() or {}
        media_folder = current_app.config["MEDIA_FOLDER"]

        # 1. Update User basic info
        if "full_name" in data and data["full_name"]:
            user.full_name = str(data["full_name"]).strip()

        if "password" in data and data["password"]:
            if len(data["password"]) >= 6:
                user.set_password(data["password"])

        # 2. Update StudentProfile
        profile = user.profile
        if not profile:
            profile = StudentProfile(user=user)
            db.session.add(profile)

        for field in ["candidate_type", "gender", "mobile_number", "college_name", "department", "course", "register_number", "branch", "reporting_time", "internship_mode"]:
            if field in data and data[field] is not None:
                setattr(profile, field, str(data[field]).strip())

        if "college_id_card" in data and data["college_id_card"]:
            if str(data["college_id_card"]).startswith("data:"):
                saved = save_base64_file(data["college_id_card"], media_folder, "college_ids", "id_doc")
                if saved:
                    profile.college_id_card = saved
            elif data["college_id_card"] is None:
                profile.college_id_card = None

        if "selfie_photo" in data and data["selfie_photo"]:
            if str(data["selfie_photo"]).startswith("data:"):
                saved = save_base64_file(data["selfie_photo"], media_folder, "selfies", "selfie")
                if saved:
                    profile.selfie_photo = saved
            elif data["selfie_photo"] is None:
                profile.selfie_photo = None

        # 3. Update Internship
        internship = user.internship
        if not internship:
            internship = Internship(student=user, start_date=date.today())
            db.session.add(internship)

        if "project_name" in data and data["project_name"]:
            internship.project_name = str(data["project_name"]).strip()

        if "branch" in data and data["branch"]:
            internship.branch = str(data["branch"]).strip()

        if "reporting_time" in data and data["reporting_time"]:
            internship.reporting_time = str(data["reporting_time"]).strip()

        if "internship_mode" in data and data["internship_mode"]:
            internship.internship_mode = str(data["internship_mode"]).strip()

        if "duration" in data and data["duration"]:
            profile.duration = str(data["duration"]).strip()
            internship.duration = str(data["duration"]).strip()

        if "start_date" in data and data["start_date"]:
            try:
                internship.start_date = date.fromisoformat(str(data["start_date"]).split("T")[0])
            except Exception:
                pass

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"detail": f"Failed to save profile: {str(e)}"}), 500

    return jsonify(student_data(user, host_url))


@student_bp.route("/api/student/internship/", methods=["GET"])
@student_bp.route("/api/student/internship", methods=["GET"])
@student_required
def internship():
    host_url = request.host_url.rstrip("/")
    return jsonify(student_data(g.current_user, host_url))


@student_bp.route("/api/student/certificate/", methods=["GET"])
@student_bp.route("/api/student/certificate", methods=["GET"])
@student_required
def my_certificate():
    cert = getattr(g.current_user.internship, "certificate", None)
    return jsonify(certificate_data(cert))


@student_bp.route("/api/student/appointment-letter/", methods=["GET"])
@student_bp.route("/api/student/appointment-letter", methods=["GET"])
@student_required
def appointment_letter():
    user = g.current_user
    internship = user.internship
    if not internship or internship.status not in ["APPROVED", "IN_PROGRESS", "COMPLETED", "CERTIFICATE_ISSUED"]:
        return jsonify({
            "detail": "Appointment letter is not available yet. It will become available once your registration is approved by the admin.",
            "status": internship.status if internship else "REGISTERED",
            "approved": False,
        }), 403

    profile = user.profile
    duration = getattr(internship, "duration", None) or getattr(profile, "duration", None) or "15 Days Internship Program"

    candidate_data = {
        "name": user.full_name,
        "email": user.email,
        "register_number": getattr(profile, "register_number", "") if profile else "",
        "project_name": internship.project_name or "Artificial Intelligence and Machine Learning",
        "internship_mode": getattr(internship, "internship_mode", None) or getattr(profile, "internship_mode", "Offline"),
        "duration": duration,
        "branch": getattr(internship, "branch", None) or getattr(profile, "branch", "100ft"),
        "reporting_time": getattr(internship, "reporting_time", None) or getattr(profile, "reporting_time", "11:00 AM"),
        "start_date": internship.start_date,
        "issue_date": getattr(internship, "updated_at", None) or internship.start_date or date.today(),
    }

    try:
        from services.appointment_letter import render_appointment_letter_pdf
        pdf_bytes = render_appointment_letter_pdf(candidate_data)

        safe_name = "".join(c for c in user.full_name if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
        response = make_response(pdf_bytes)
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = f'inline; filename="Wingroo_Appointment_Letter_{safe_name}.pdf"'
        return response
    except Exception as e:
        return jsonify({"detail": f"Failed to generate appointment letter PDF: {str(e)}"}), 500

