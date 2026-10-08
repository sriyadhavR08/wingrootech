from datetime import date
from flask import Blueprint, request, jsonify, current_app, g
from models import db, User, StudentProfile, Internship
from services.auth import generate_tokens, jwt_required
from services.storage import save_base64_file

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/auth/register/", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    full_name = data.get("full_name", "").strip()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    if not email:
        return jsonify({"email": ["Email is required."]}), 400
    if not full_name:
        return jsonify({"full_name": ["Full name is required."]}), 400
    if not password:
        return jsonify({"password": ["Password is required."]}), 400
    if password != confirm_password:
        return jsonify({"confirm_password": ["Passwords do not match."]}), 400
    if len(password) < 6:
        return jsonify({"password": ["Password must be at least 6 characters."]}), 400

    existing_user = User.query.filter(db.func.lower(User.email) == email).first()
    if existing_user:
        # Check if password matches their main website / Wingroo account password
        if not existing_user.check_password(password):
            return jsonify({
                "password": ["An account with this email already exists on Wingroo. Please enter your correct Wingroo account password to link your certificate registration."]
            }), 400
        user = existing_user
        if full_name and not user.full_name:
            user.full_name = full_name
    else:
        user = None

    reg_no = data.get("register_number", "").strip().upper()
    if not reg_no:
        return jsonify({"register_number": ["Register number is required."]}), 400

    existing_profile_with_reg = StudentProfile.query.filter(db.func.upper(StudentProfile.register_number) == reg_no).first()
    if existing_profile_with_reg and (not user or existing_profile_with_reg.user_id != user.id):
        return jsonify({"register_number": ["Register number already registered to another candidate."]}), 400

    start_date_str = data.get("start_date")
    if not start_date_str:
        return jsonify({"start_date": ["Start date is required."]}), 400
    try:
        start_date = date.fromisoformat(start_date_str)
    except ValueError:
        return jsonify({"start_date": ["Invalid start date format (YYYY-MM-DD)."]}), 400

    end_date = None
    if data.get("end_date"):
        try:
            end_date = date.fromisoformat(data["end_date"])
            if end_date <= start_date:
                return jsonify({"end_date": ["End date must be after start date."]}), 400
        except ValueError:
            return jsonify({"end_date": ["Invalid end date format (YYYY-MM-DD)."]}), 400

    cand_type = data.get("candidate_type", "COLLEGE_INTERN")

    # Save uploaded identity documents
    media_folder = current_app.config["MEDIA_FOLDER"]
    college_id_path = save_base64_file(data.get("college_id_card"), media_folder, "college_ids", "id_doc")
    selfie_path = save_base64_file(data.get("selfie_photo"), media_folder, "selfies", "selfie")

    try:
        if not user:
            user = User(
                email=email,
                full_name=full_name,
                role="STUDENT",
            )
            user.set_password(password)
            db.session.add(user)
            db.session.flush()

        profile = StudentProfile.query.filter_by(user_id=user.id).first()
        if not profile:
            profile = StudentProfile(
                user=user,
                candidate_type=cand_type,
                gender=data.get("gender", "MALE"),
                mobile_number=data.get("mobile_number", ""),
                college_name=data.get("college_name", ""),
                department=data.get("department", ""),
                course=data.get("course", ""),
                register_number=reg_no,
                college_id_card=college_id_path,
                selfie_photo=selfie_path,
            )
            db.session.add(profile)
        else:
            profile.candidate_type = cand_type
            if data.get("mobile_number"): profile.mobile_number = data.get("mobile_number")
            if data.get("college_name"): profile.college_name = data.get("college_name")
            if data.get("department"): profile.department = data.get("department")
            if data.get("course"): profile.course = data.get("course")
            if reg_no: profile.register_number = reg_no
            if college_id_path: profile.college_id_card = college_id_path
            if selfie_path: profile.selfie_photo = selfie_path

        internship = Internship.query.filter_by(student_id=user.id).first()
        if not internship:
            internship = Internship(
                student=user,
                project_name=data.get("project_name", ""),
                start_date=start_date,
                end_date=end_date,
                status="REGISTERED",
            )
            db.session.add(internship)
        else:
            internship.project_name = data.get("project_name", "") or internship.project_name
            internship.start_date = start_date
            internship.end_date = end_date
            internship.status = "REGISTERED"

        db.session.commit()

        return jsonify({"success": True, "message": "Registration successful! You can now sign in with your account credentials."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"detail": f"Registration failed: {str(e)}"}), 500


@auth_bp.route("/api/auth/candidate-register/", methods=["POST"])
def candidate_register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    full_name = data.get("full_name", "").strip()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")
    phone = data.get("phone", "") or data.get("mobile_number", "")
    college = data.get("college", "") or data.get("college_name", "Registered Candidate")

    if not email:
        return jsonify({"detail": "Email address is required."}), 400
    if not full_name:
        return jsonify({"detail": "Full name is required."}), 400
    if not password:
        return jsonify({"detail": "Password is required."}), 400
    if len(password) < 6:
        return jsonify({"detail": "Password must be at least 6 characters long."}), 400
    if password != confirm_password:
        return jsonify({"detail": "Passwords do not match."}), 400

    existing_user = User.query.filter(db.func.lower(User.email) == email).first()
    if existing_user:
        return jsonify({"detail": "An account with this email already exists. Please sign in with your password."}), 400

    try:
        user = User(
            email=email,
            full_name=full_name,
            role="STUDENT",
            is_active=True,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        import secrets
        auto_reg_no = f"WIN-{secrets.token_hex(4).upper()}"
        profile = StudentProfile(
            user=user,
            candidate_type="COLLEGE_INTERN",
            gender="MALE",
            mobile_number=phone or "N/A",
            college_name=college or "Registered Candidate",
            department=data.get("department", "General"),
            course=data.get("course", "Internship Program"),
            register_number=auto_reg_no,
        )
        db.session.add(profile)
        db.session.commit()

        access_token, refresh_token = generate_tokens(user)
        return jsonify({
            "success": True,
            "message": "Account created successfully! Welcome to Wingroo.",
            "access": access_token,
            "refresh": refresh_token,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"detail": f"Account creation failed: {str(e)}"}), 500


@auth_bp.route("/api/auth/login/", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"detail": "Must provide both email and password."}), 400

    user = User.query.filter(db.func.lower(User.email) == email).first()
    if not user or not user.check_password(password):
        return jsonify({"detail": "Invalid email or password. If you haven't set a password yet, please click Forgot Password."}), 401

    if not user.is_active:
        return jsonify({"detail": "This account is inactive."}), 401

    access_token, refresh_token = generate_tokens(user)
    return jsonify({
        "access": access_token,
        "refresh": refresh_token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }), 200


@auth_bp.route("/api/auth/me/", methods=["GET"])
@jwt_required
def me():
    u = g.current_user
    return jsonify({
        "id": u.id,
        "full_name": u.full_name,
        "email": u.email,
        "role": u.role,
    }), 200


@auth_bp.route("/api/auth/logout/", methods=["POST"])
def logout():
    return jsonify({"message": "Signed out."}), 200


@auth_bp.route("/api/auth/token/refresh/", methods=["POST"])
def token_refresh():
    import jwt
    data = request.get_json() or {}
    refresh_token = data.get("refresh")
    if not refresh_token:
        return jsonify({"detail": "Refresh token required."}), 400
    try:
        payload = jwt.decode(refresh_token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        if payload.get("type") != "refresh":
            return jsonify({"detail": "Invalid token type."}), 400
        user = User.query.get(payload["user_id"])
        if not user or not user.is_active:
            return jsonify({"detail": "User not found or inactive."}), 401
        access_token, _ = generate_tokens(user)
        return jsonify({"access": access_token}), 200
    except Exception:
        return jsonify({"detail": "Token is invalid or expired."}), 401


@auth_bp.route("/api/auth/forgot-password/", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    reg_no = data.get("register_number", "").strip().upper()

    if not email and not reg_no:
        return jsonify({"detail": "Please provide your registered email or register number."}), 400

    user = None
    if email:
        user = User.query.filter(db.func.lower(User.email) == email).first()
    if not user and reg_no:
        profile = StudentProfile.query.filter(db.func.upper(StudentProfile.register_number) == reg_no).first()
        if profile and profile.user:
            user = profile.user

    # If user doesn't exist in User table yet, check if they exist in internship_applications or event_registrations
    if not user and (email or reg_no):
        from database import get_db_connection
        conn, db_type = get_db_connection()
        try:
            cursor = conn.cursor()
            query_val = email or reg_no
            row = None
            if db_type == "mysql":
                cursor.execute("SELECT name, email FROM internship_applications WHERE LOWER(email) = %s OR application_no = %s LIMIT 1", (query_val.lower(), query_val))
                row = cursor.fetchone()
                if not row:
                    cursor.execute("SELECT name, email FROM event_registrations WHERE LOWER(email) = %s OR registration_no = %s LIMIT 1", (query_val.lower(), query_val))
                    row = cursor.fetchone()
            else:
                cursor.execute("SELECT name, email FROM internship_applications WHERE LOWER(email) = ? OR application_no = ? LIMIT 1", (query_val.lower(), query_val))
                row = cursor.fetchone()
                if not row:
                    cursor.execute("SELECT name, email FROM event_registrations WHERE LOWER(email) = ? OR registration_no = ? LIMIT 1", (query_val.lower(), query_val))
                    row = cursor.fetchone()
            if row:
                row_dict = dict(row)
                cand_name = row_dict.get("name") or "Candidate"
                cand_email = (row_dict.get("email") or "").lower()
                if cand_email:
                    new_user = User(
                        email=cand_email,
                        full_name=cand_name,
                        role="STUDENT",
                        is_active=True
                    )
                    new_user.set_password("TempPassword123!")
                    db.session.add(new_user)
                    db.session.commit()
                    user = new_user
        except Exception as e:
            print("[Forgot password lookup error]", e)

    if not user:
        return jsonify({"detail": "No candidate account found matching this email or register number."}), 404

    return jsonify({
        "success": True,
        "message": f"Account verified for {user.full_name}.",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }), 200


@auth_bp.route("/api/auth/reset-password/", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    email = data.get("email", "").strip().lower()
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not new_password:
        return jsonify({"detail": "New password is required."}), 400
    if len(new_password) < 6:
        return jsonify({"detail": "Password must be at least 6 characters long."}), 400
    if new_password != confirm_password:
        return jsonify({"detail": "Passwords do not match."}), 400

    user = None
    if user_id:
        user = User.query.get(user_id)
    elif email:
        user = User.query.filter(db.func.lower(User.email) == email).first()

    if not user:
        return jsonify({"detail": "User account not found."}), 404

    user.set_password(new_password)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Password successfully updated! You can now login with your new password."
    }), 200

