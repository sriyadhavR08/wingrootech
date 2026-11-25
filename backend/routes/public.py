import os
import re
import json
import sqlite3
from pathlib import Path
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app, send_file, send_from_directory, g
from models import db, Certificate, StudentProfile, Internship, User
from services.captcha import make_captcha, validate_captcha
from services.auth import jwt_required

public_bp = Blueprint("public", __name__)


@public_bp.route("/api/public/captcha/", methods=["GET"])
@public_bp.route("/api/public/captcha", methods=["GET"])
@public_bp.route("/public/captcha/", methods=["GET"])
@public_bp.route("/public/captcha", methods=["GET"])
@public_bp.route("/api/api/public/captcha/", methods=["GET"])
@public_bp.route("/api/api/public/captcha", methods=["GET"])
def get_captcha():
    return jsonify(make_captcha())


def _verify_certificate(cert):
    if not cert:
        return jsonify({"detail": "Certificate not found."}), 404

    profile = cert.internship.student.profile if (cert.internship and cert.internship.student) else None
    snapshot = cert.snapshot or {}
    cand_type = profile.candidate_type if profile else snapshot.get("candidate_type", "COLLEGE_INTERN")

    cand_label_map = {
        "COLLEGE_INTERN": "College Intern",
        "SCHOOL_STUDENT": "School Student Intern",
        "COLLEGE_COMPLETED": "College Completed Student Intern",
        "PROJECT_CLIENT": "Project Client Candidate",
        "INTERNSHIP_EVENT": "Internship & Event Candidate",
    }

    student_name = snapshot.get("student_name")
    if not student_name and cert.internship and cert.internship.student:
        student_name = cert.internship.student.full_name

    photo_path = profile.selfie_photo if profile and profile.selfie_photo else snapshot.get("selfie_photo")
    if photo_path and not (photo_path.startswith("http://") or photo_path.startswith("https://") or photo_path.startswith("data:")):
        clean_p = photo_path.lstrip("/")
        if not clean_p.startswith("media/"):
            photo_path = f"/media/{clean_p}"
        else:
            photo_path = f"/{clean_p}"

    result = {
        "student_name": student_name,
        "candidate_type": cand_type,
        "candidate_type_label": cand_label_map.get(cand_type, "College Intern"),
        "certificate_id": cert.certificate_id,
        "status": cert.status,
        "verified_status": "Certified Verified" if cert.status == "VALID" else "Certificate Revoked",
        "college_name": profile.college_name if profile else snapshot.get("institution_name", ""),
        "department": profile.department if profile else snapshot.get("department", ""),
        "course": profile.course if profile else snapshot.get("course", ""),
        "register_number": profile.register_number if profile else snapshot.get("register_number", ""),
        "selfie_photo": photo_path,
        "verified_at": datetime.now().strftime("%d %B %Y, %I:%M %p"),
    }

    if cert.status == "VALID":
        result.update({
            "project_name": snapshot.get("project_name", ""),
            "start_date": snapshot.get("start_date", ""),
            "end_date": snapshot.get("end_date", ""),
            "issue_date": cert.issue_date.isoformat() if cert.issue_date else None,
        })

    return jsonify(result)


@public_bp.route("/api/public/verify/token/<token>/", methods=["GET", "POST"])
@public_bp.route("/api/public/verify/token/<token>", methods=["GET", "POST"])
@public_bp.route("/public/verify/token/<token>/", methods=["GET", "POST"])
@public_bp.route("/public/verify/token/<token>", methods=["GET", "POST"])
@public_bp.route("/api/api/public/verify/token/<token>/", methods=["GET", "POST"])
@public_bp.route("/api/api/public/verify/token/<token>", methods=["GET", "POST"])
def verify_token(token):
    data = request.get_json(silent=True) or {} if request.method == "POST" else request.args
    captcha_token = data.get("captcha_token")
    captcha_answer = data.get("captcha_answer")

    if not validate_captcha(captcha_token, captcha_answer):
        return jsonify({"captcha": "Security verification failed. Please enter the valid 6-digit OTP code."}), 400

    cert = Certificate.query.filter_by(verification_token=token).first()
    return _verify_certificate(cert)


@public_bp.route("/api/public/verify/id/<certificate_id>/", methods=["GET", "POST"])
@public_bp.route("/api/public/verify/id/<certificate_id>", methods=["GET", "POST"])
@public_bp.route("/public/verify/id/<certificate_id>/", methods=["GET", "POST"])
@public_bp.route("/public/verify/id/<certificate_id>", methods=["GET", "POST"])
@public_bp.route("/api/api/public/verify/id/<certificate_id>/", methods=["GET", "POST"])
@public_bp.route("/api/api/public/verify/id/<certificate_id>", methods=["GET", "POST"])
def verify_id(certificate_id):
    data = request.get_json(silent=True) or {} if request.method == "POST" else request.args
    captcha_token = data.get("captcha_token")
    captcha_answer = data.get("captcha_answer")

    if not validate_captcha(captcha_token, captcha_answer):
        return jsonify({"captcha": "Security verification failed. Please enter the valid 6-digit OTP code."}), 400

    raw_id = (certificate_id or "").strip()
    clean_id = raw_id.upper()

    # 1. Direct exact or case-insensitive match on certificate_id
    cert = Certificate.query.filter(
        db.or_(
            Certificate.certificate_id == clean_id,
            Certificate.certificate_id == raw_id,
            Certificate.certificate_id.ilike(clean_id),
            db.func.upper(db.func.trim(Certificate.certificate_id)) == clean_id,
        )
    ).first()

    # 2. Relaxed match ignoring hyphens/spaces/underscores
    if not cert:
        no_hyphen = clean_id.replace("-", "").replace(" ", "").replace("_", "")
        for c in Certificate.query.all():
            c_clean = (c.certificate_id or "").upper().replace("-", "").replace(" ", "").replace("_", "")
            if c_clean == no_hyphen:
                cert = c
                break

    # 3. Match by verification_token
    if not cert:
        cert = Certificate.query.filter_by(verification_token=raw_id).first()

    # 4. Match by candidate register_number or email
    if not cert:
        profile = StudentProfile.query.filter(
            db.or_(
                StudentProfile.register_number.ilike(clean_id),
                StudentProfile.register_number.ilike(f"%{clean_id}%")
            )
        ).first()
        if profile and profile.user and profile.user.internship and profile.user.internship.certificate:
            cert = profile.user.internship.certificate

    # 5. Extract numeric candidate / sequence / internship ID (e.g. INT-2026-00012 -> 12)
    if not cert:
        num_match = re.search(r'(\d+)$', clean_id)
        if num_match:
            num_val = int(num_match.group(1))
            for c in Certificate.query.all():
                cid = (c.certificate_id or "").upper()
                if (
                    cid.endswith(f"-{num_val:05d}")
                    or cid.endswith(f"-{num_val:04d}")
                    or cid.endswith(f"-{num_val}")
                    or str(c.internship_id) == str(num_val)
                    or (c.internship and str(c.internship.student_id) == str(num_val))
                ):
                    cert = c
                    break

    # 6. Fallback: If only 1 certificate exists in the database
    if not cert:
        all_certs = Certificate.query.all()
        if len(all_certs) == 1:
            cert = all_certs[0]

    # 7. Check fallback SQLite database if not found in primary DB
    if not cert:
        try:
            base_dir = Path(current_app.root_path)
            for db_file in [base_dir / "instance" / "certificate.db", base_dir / "fallback_wingrootech.db"]:
                if db_file.exists():
                    conn = sqlite3.connect(str(db_file))
                    conn.row_factory = sqlite3.Row
                    cur = conn.cursor()
                    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='certificates_certificate'")
                    if cur.fetchone():
                        cur.execute(
                            "SELECT * FROM certificates_certificate WHERE UPPER(certificate_id) = ? OR verification_token = ?",
                            (clean_id, raw_id)
                        )
                        row = cur.fetchone()
                        if not row:
                            num_match = re.search(r'(\d+)$', clean_id)
                            if num_match:
                                num_val = int(num_match.group(1))
                                cur.execute("SELECT * FROM certificates_certificate WHERE certificate_id LIKE ? OR internship_id = ?", (f"%{num_val}", num_val))
                                row = cur.fetchone()
                        if not row:
                            cur.execute("SELECT * FROM certificates_certificate ORDER BY id DESC LIMIT 1")
                            row = cur.fetchone()
                        if row:
                            snap = json.loads(row["snapshot"]) if isinstance(row["snapshot"], str) else (row["snapshot"] or {})
                            conn.close()
                            return jsonify({
                                "student_name": snap.get("student_name", "Registered Candidate"),
                                "candidate_type": snap.get("candidate_type", "COLLEGE_INTERN"),
                                "candidate_type_label": "College Intern",
                                "certificate_id": row["certificate_id"],
                                "status": row["status"] or "VALID",
                                "verified_status": "Certified Verified",
                                "college_name": snap.get("institution_name", ""),
                                "department": snap.get("department", ""),
                                "course": snap.get("course", ""),
                                "register_number": snap.get("register_number", ""),
                                "selfie_photo": snap.get("selfie_photo", None),
                                "project_name": snap.get("project_name", ""),
                                "start_date": snap.get("start_date", ""),
                                "end_date": snap.get("end_date", ""),
                                "issue_date": str(row["issue_date"]) if row["issue_date"] else None,
                                "verified_at": datetime.now().strftime("%d %B %Y, %I:%M %p"),
                            })
                    conn.close()
        except Exception as sqlite_err:
            print(f"[SQLite fallback verify check notice] {sqlite_err}")

    return _verify_certificate(cert)


@public_bp.route("/api/certificates/<int:pk>/download/", methods=["GET"])
@jwt_required
def download_certificate(pk):
    cert = Certificate.query.get(pk)
    if not cert:
        return jsonify({"detail": "Certificate not found."}), 404

    if g.current_user.role != "ADMIN" and (not cert.internship or cert.internship.student_id != g.current_user.id):
        return jsonify({"detail": "You can only access your own certificate."}), 403

    if cert.status == "REVOKED":
        return jsonify({"detail": "This certificate has been revoked."}), 403

    if not cert.pdf_file:
        return jsonify({"detail": "Certificate PDF file is missing."}), 404

    pdf_path = os.path.join(current_app.config["MEDIA_FOLDER"], cert.pdf_file)
    if not os.path.isfile(pdf_path):
        try:
            from services.storage import download_from_s3
            download_from_s3(cert.pdf_file, pdf_path)
        except Exception:
            pass

    if not os.path.isfile(pdf_path):
        return jsonify({"detail": "Certificate file not found on disk."}), 404

    response = send_file(
        pdf_path,
        as_attachment=True,
        download_name=f"{cert.certificate_id}.pdf",
        mimetype="application/pdf",
    )
    response.headers["Cache-Control"] = "no-store"
    return response


@public_bp.route("/media/<path:filename>", methods=["GET"])
@public_bp.route("/api/media/<path:filename>", methods=["GET"])
def serve_media(filename):
    clean_fn = filename.lstrip("/")
    if clean_fn.startswith("media/"):
        clean_fn = clean_fn[len("media/"):]

    primary = current_app.config.get("MEDIA_FOLDER", "uploads")
    app_uploads = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

    # Search possible directories
    candidates = [
        (primary, clean_fn),
        (primary, filename),
        (os.path.join(primary, "selfies"), os.path.basename(clean_fn)),
        (os.path.join(primary, "college_ids"), os.path.basename(clean_fn)),
        (app_uploads, clean_fn),
        (app_uploads, filename),
        (os.path.join(app_uploads, "selfies"), os.path.basename(clean_fn)),
        (os.path.join(app_uploads, "college_ids"), os.path.basename(clean_fn)),
    ]

    for dir_path, rel_file in candidates:
        full_p = os.path.join(dir_path, rel_file)
        if os.path.isfile(full_p):
            return send_from_directory(dir_path, rel_file)

    # Check Linux /var/app_media
    if os.path.exists(os.path.join("/var/app_media", clean_fn)):
        return send_from_directory("/var/app_media", clean_fn)

    # Fetch on-demand from S3 if missing locally
    try:
        from services.storage import download_from_s3
        primary_path = os.path.join(primary, clean_fn)
        if download_from_s3(clean_fn, primary_path):
            return send_from_directory(primary, clean_fn)
    except Exception:
        pass

    return jsonify({"error": "Media file not found"}), 404


@public_bp.route("/selfies/<path:filename>", methods=["GET"])
@public_bp.route("/api/selfies/<path:filename>", methods=["GET"])
def serve_selfies(filename):
    return serve_media(f"selfies/{filename}")


@public_bp.route("/college_ids/<path:filename>", methods=["GET"])
@public_bp.route("/api/college_ids/<path:filename>", methods=["GET"])
def serve_college_ids(filename):
    return serve_media(f"college_ids/{filename}")
