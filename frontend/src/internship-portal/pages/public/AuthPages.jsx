import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import { api, errorText } from "../../services/api";
import { Field, Notice } from "../../components/Common";
import StudentFields from "../../components/StudentFields";
import logo from "../../assets/WINGROO.jpeg";
export function Login() {
  const [values, setValues] = useState({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefix = location.pathname.startsWith("/internship") ? "/internship" : "";

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await login(values);
      navigate(u.role === "ADMIN" ? `${prefix}/admin/dashboard` : `${prefix}/student/dashboard`);
    } catch (e) {
      setError(await errorText(e));
    } finally {
      setBusy(false);
    }
  }
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [forgotUserId, setForgotUserId] = useState(null);
  const [forgotStep, setForgotStep] = useState("verify"); // 'verify' | 'reset'
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotErr, setForgotErr] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  async function handleForgotVerify(e) {
    e.preventDefault();
    setForgotErr("");
    setForgotMsg("");
    setForgotBusy(true);
    try {
      const res = await api.post("/auth/forgot-password/", { email: forgotEmail, register_number: forgotEmail });
      setForgotUserId(res.data.user_id);
      setForgotMsg(res.data.message || "Account verified. Please set your new password.");
      setForgotStep("reset");
    } catch (err) {
      setForgotErr(await errorText(err));
    } finally {
      setForgotBusy(false);
    }
  }

  async function handleForgotReset(e) {
    e.preventDefault();
    setForgotErr("");
    setForgotMsg("");
    setForgotBusy(true);
    try {
      const res = await api.post("/auth/reset-password/", {
        user_id: forgotUserId,
        email: forgotEmail,
        new_password: forgotNewPass,
        confirm_password: forgotConfirmPass
      });
      setForgotMsg(res.data.message || "Password successfully reset! You can now login.");
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep("verify");
        setForgotNewPass("");
        setForgotConfirmPass("");
      }, 2500);
    } catch (err) {
      setForgotErr(await errorText(err));
    } finally {
      setForgotBusy(false);
    }
  }

  return (
    <section className="card auth-card">
      <img className="auth-logo" src={logo} alt="Wingroo" />
      <h1 className="h3">{showForgot ? "Reset Password" : "Welcome back"}</h1>
      <p className="text-secondary">
        {showForgot 
          ? "Enter your registered email or register number to reset your password." 
          : "Sign in to access your internship certificate portal."}
      </p>

      {showForgot ? (
        <div>
          {forgotMsg && <Notice type="success" message={forgotMsg} />}
          {forgotErr && <Notice message={forgotErr} />}

          {forgotStep === "verify" ? (
            <form onSubmit={handleForgotVerify}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Registered Email or Register Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="candidate@example.com or Reg No"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary w-100 mb-3" disabled={forgotBusy}>
                {forgotBusy ? "Verifying..." : "Verify Candidate Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotReset}>
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password (min 6 characters)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="New password"
                  value={forgotNewPass}
                  onChange={(e) => setForgotNewPass(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={forgotConfirmPass}
                  onChange={(e) => setForgotConfirmPass(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary w-100 mb-3" disabled={forgotBusy}>
                {forgotBusy ? "Updating Password..." : "Set New Password"}
              </button>
            </form>
          )}

          <div className="text-center">
            <button 
              type="button" 
              onClick={() => { setShowForgot(false); setForgotErr(""); setForgotMsg(""); }} 
              className="btn btn-link text-decoration-none"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      ) : (
        <>
          <Notice message={error} />
          <form onSubmit={submit}>
            <div className="row g-3 single-fields">
              <Field
                name="email"
                label="Email"
                type="email"
                autoComplete="username"
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
              />
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label mb-0 fw-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotStep("verify"); setForgotErr(""); setForgotMsg(""); }}
                    className="btn btn-link p-0 text-decoration-none small text-primary"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  autoComplete="current-password"
                  value={values.password || ""}
                  onChange={(e) => setValues({ ...values, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <button className="btn btn-primary w-100 mt-4" disabled={busy}>
              {busy ? "Signing in…" : "Login"}
            </button>
          </form>
          <p className="mb-0 mt-4 text-center">
            New to Wingroo? <Link to={`${prefix}/register`}>Create an account</Link>
          </p>
        </>
      )}
    </section>
  );
}
export function Register() {
  const location = useLocation();
  const prefix = location.pathname.startsWith("/internship") ? "/internship" : "";
  const [values, setValues] = useState({ candidate_type: "COLLEGE_INTERN" }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (values.password !== values.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    const candType = values.candidate_type || "COLLEGE_INTERN";
    if (!values.college_id_card) {
      const docLabel =
        candType === "SCHOOL_STUDENT"
          ? "School ID card / Candidate ID proof"
          : candType === "COLLEGE_COMPLETED"
          ? "ID proof (Aadhaar / College ID / Degree Certificate / Govt ID)"
          : "College ID card photo";
      setError(`Please attach your ${docLabel}.`);
      return;
    }
    if (!values.selfie_photo) {
      setError("Please provide a selfie photo (Upload file or Snap Photo).");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/register/", {
        ...values,
        candidate_type: candType,
      });
      setDone(true);
      window.scrollTo(0, 0);
    } catch (e) {
      setError(await errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="registration">
      <div className="eyebrow">PORTAL ENROLLMENT & REGISTRATION</div>
      <h1 className="mt-2">Create Your Candidate Account</h1>
      <p className="text-secondary">
        Register as a School Candidate Intern, College Candidate Intern, or College Completed Candidate Intern for your verified credential.
      </p>
      {done ? (
        <section className="card p-5">
          <Notice
            type="success"
            message="Registration successful! Your profile has been registered in the system."
          />
          <Link className="btn btn-primary" to={`${prefix}/login`}>
            Continue to login
          </Link>
        </section>
      ) : (
        <form className="card registration-form" onSubmit={submit}>
          <StudentFields
            values={values}
            onChange={(e) =>
              setValues({ ...values, [e.target.name]: e.target.value })
            }
            account
          />
          <Notice message={error} />
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <span>
              Already registered? <Link to={`${prefix}/login`}>Login</Link>
            </span>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
