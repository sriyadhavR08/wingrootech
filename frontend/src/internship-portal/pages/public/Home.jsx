import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/Auth";

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const prefix = location.pathname.startsWith('/internship') ? '/internship' : '';
  const admin = user?.role === 'ADMIN';
  const targetDashboard = admin ? `${prefix}/admin/dashboard` : `${prefix}/student/dashboard`;

  return (
    <>
      <section className="hero row align-items-center g-5">
        <div className="col-lg-7">
          <div className="eyebrow mb-3">YOUR WORK. YOUR ACHIEVEMENT.</div>
          <h1>
            Experience earned.
            <br />
            <span>Achievement verified.</span>
          </h1>
          <p className="lead mt-4 fw-semibold text-dark">Wingroo Technologies Verified Internship Portal</p>
          <p className="text-secondary hero-copy">
            Portal for college interns, school interns, and graduate candidates. Complete your internship milestones, access official verified credentials, and authenticate certificates instantly.
          </p>
          <div className="d-flex flex-wrap gap-3 mt-4">
            {user ? (
              <Link to={targetDashboard} className="btn btn-primary btn-lg shadow-sm">
                Open {admin ? 'Admin' : 'Candidate'} Dashboard{" "}
                <i aria-hidden="true" className="bi bi-arrow-right ms-2" />
              </Link>
            ) : (
              <Link to={`${prefix}/register`} className="btn btn-primary btn-lg shadow-sm">
                Register now{" "}
                <i aria-hidden="true" className="bi bi-arrow-right ms-2" />
              </Link>
            )}
            <Link to={`${prefix}/verify`} className="btn btn-outline-primary btn-lg">
              Verify certificate
            </Link>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="hero-panel shadow-sm">
            <div className="hero-icon">
              <i aria-hidden="true" className="bi bi-patch-check" />
            </div>
            <div className="eyebrow">WINGROO CREDENTIALS</div>
            <h2 className="h3 mt-3">A milestone worth keeping.</h2>
            <p className="text-secondary">
              Your professional journey across internship and research training, with verified digital credentials.
            </p>
            <div className="journey-step">
              <span>01</span>
              <div>
                <strong>Register your candidate profile</strong>
                <small>Upload ID proof, take a live selfie, and submit your profile.</small>
              </div>
            </div>
            <div className="journey-step">
              <span>02</span>
              <div>
                <strong>Complete & get evaluated</strong>
                <small>Reviewed & approved by engineering leads.</small>
              </div>
            </div>
            <div className="journey-step">
              <span>03</span>
              <div>
                <strong>Download & verify</strong>
                <small>QR-secured certificate & evaluation transcript.</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="trust-row row g-4">
        <div className="col-md-4">
          <i aria-hidden="true" className="bi bi-person-check" />
          <h3>Reviewed by people</h3>
          <p>
            Certificates are issued only after completion and admin approval.
          </p>
        </div>
        <div className="col-md-4">
          <i aria-hidden="true" className="bi bi-file-earmark-pdf" />
          <h3>Ready when you are</h3>
          <p>Access your approved certificate from your candidate dashboard.</p>
        </div>
        <div className="col-md-4">
          <i aria-hidden="true" className="bi bi-qr-code-scan" />
          <h3>Easy to verify</h3>
          <p>Scan the QR or enter a certificate ID. No account needed.</p>
        </div>
      </section>
    </>
  );
}
