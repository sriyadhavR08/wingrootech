import { useEffect, useState } from "react";
import { api, errorText, resolveMediaUrl } from "../../services/api";
import { Loading, Notice, Status, dateLabel } from "../../components/Common";
import CertificateActions from "../../components/CertificateActions";
import StudentFields from "../../components/StudentFields";

const VENUE_MAP = {
  "100ft": "2nd Floor, SS Complex, 64/1, 7th Street, Tatabad, Coimbatore, Tamil Nadu - 641012",
  "hopes": "GR complex , 1st floor . 1567 avinashi rd , peelamedu , coimbatore - 641004",
  "kuniyamuthur": "1st floor , AAKIFAH 2017 Complex , Palakkad main rd , near muthoot finance kuniyamuthur - 641008",
};

function getVenue(branch) {
  const b = (branch || "").toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
  if (b.includes("hope")) return VENUE_MAP.hopes;
  if (b.includes("kuniya")) return VENUE_MAP.kuniyamuthur;
  return VENUE_MAP["100ft"];
}

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [viewDoc, setViewDoc] = useState(null);
  const [idImgError, setIdImgError] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);

  async function fetchAppointmentLetterBlob() {
    const res = await api.get("/student/appointment-letter/", {
      responseType: "blob",
    });
    return new Blob([res.data], { type: "application/pdf" });
  }

  async function handleOpenAppointmentLetter() {
    setLoadingLetter(true);
    setError("");
    try {
      const blob = await fetchAppointmentLetterBlob();
      const url = URL.createObjectURL(blob);
      const safeName = (data?.full_name || "Candidate").replace(/[^a-zA-Z0-9_-]/g, "_");
      setViewDoc({
        title: `Internship Appointment Letter - ${data?.full_name || "Candidate"}`,
        url: url,
        isPdf: true,
        downloadName: `Wingroo_Appointment_Letter_${safeName}.pdf`,
      });
    } catch (err) {
      setError(await errorText(err));
    } finally {
      setLoadingLetter(false);
    }
  }

  async function handleDownloadAppointmentLetter() {
    setLoadingLetter(true);
    setError("");
    try {
      const blob = await fetchAppointmentLetterBlob();
      const url = URL.createObjectURL(blob);
      const safeName = (data?.full_name || "Candidate").replace(/[^a-zA-Z0-9_-]/g, "_");
      const link = document.createElement("a");
      link.href = url;
      link.download = `Wingroo_Appointment_Letter_${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch (err) {
      setError(await errorText(err));
    } finally {
      setLoadingLetter(false);
    }
  }

  async function loadProfile() {
    try {
      const res = await api.get("/student/profile/");
      setData(res.data);
      setEditValues(res.data);
    } catch (e) {
      try {
        const raw =
          sessionStorage.getItem("wingroo_student_user") ||
          localStorage.getItem("wingroo_student_user");
        if (raw) {
          const u = JSON.parse(raw);
          const fallback = {
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            candidate_type: u.candidate_type || "COLLEGE_INTERN",
            candidate_type_display: u.candidate_type_display || "Internship & Event Candidate",
            college_name: u.college || "Registered Candidate",
            department: u.department || "Computer Science",
            course: u.course || "B.E / B.Tech",
            register_number: u.register_number || "WIN-CANDIDATE",
            gender: u.gender || "MALE",
            mobile_number: u.mobile_number || "",
            branch: u.branch || "100ft",
            project_name: "Data Analytics",
            status: "REGISTERED",
            start_date: new Date().toISOString().split("T")[0],
            end_date: null,
            duration_days: null,
            certificate: null,
          };
          setData(fallback);
          setEditValues(fallback);
          return;
        }
      } catch {}
      setError(await errorText(e));
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSaveProfile(e) {
    if (e) e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const res = await api.put("/student/profile/", editValues);
      setData(res.data);
      setEditValues(res.data);
      setEditing(false);
      setMessage("Your profile details and documents have been updated successfully!");

      // Update local and session storage
      try {
        const stored =
          sessionStorage.getItem("wingroo_student_user") ||
          localStorage.getItem("wingroo_student_user");
        if (stored) {
          const u = { ...JSON.parse(stored), ...res.data };
          sessionStorage.setItem("wingroo_student_user", JSON.stringify(u));
          localStorage.setItem("wingroo_student_user", JSON.stringify(u));
        }
      } catch {}
    } catch (err) {
      setError(await errorText(err));
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) return <Notice message={error} />;
  if (!data) return <Loading />;

  const collegeIdUrl = resolveMediaUrl(data.college_id_card);
  const isPdf =
    collegeIdUrl &&
    (collegeIdUrl.toLowerCase().includes(".pdf") ||
      collegeIdUrl.startsWith("data:application/pdf"));
  const selfieUrl = resolveMediaUrl(data.selfie_photo);
  const docTitle =
    data.candidate_type === "SCHOOL_STUDENT"
      ? "School ID Card / Student Proof"
      : data.candidate_type === "COLLEGE_COMPLETED"
      ? "ID Proof (Govt / Degree)"
      : "College ID Card";

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div>
          <div className="eyebrow">CANDIDATE WORKSPACE</div>
          <h1 className="mt-1 mb-0">Welcome, {data.full_name}</h1>
          <p className="text-secondary mb-0">
            {data.register_number} · {data.email}
          </p>
        </div>

        <div>
          <button
            type="button"
            className={`btn ${editing ? "btn-secondary" : "btn-primary"} rounded-pill py-2 px-3 fw-semibold shadow-sm d-flex align-items-center gap-2`}
            onClick={() => {
              setEditing(!editing);
              if (!editing) setEditValues({ ...data });
              setMessage("");
              setError("");
            }}
            disabled={busy}
          >
            <i className={`bi ${editing ? "bi-x-lg" : "bi-pencil-square"}`}></i>
            <span>{editing ? "Cancel Editing" : "Edit Profile Details & Documents"}</span>
          </button>
        </div>
      </div>

      <Notice message={error} />
      <Notice message={message} type="success" />

      {/* EDITING FORM */}
      {editing ? (
        <section className="card p-4 shadow-sm border-0 mb-4 rounded-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 flex-wrap gap-2">
            <div>
              <h2 className="h5 fw-bold mb-1 text-primary">
                <i className="bi bi-pencil-square me-2"></i>Edit Candidate Profile & Uploaded Documents
              </h2>
              <p className="text-secondary small mb-0">
                Update your personal info, academic details, project information, and upload or recapture your ID proof & selfie.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setEditing(false)}
              disabled={busy}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveProfile}>
            <StudentFields
              values={editValues}
              onChange={(e) =>
                setEditValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))
              }
              account={false}
            />

            <div className="mt-4 pt-3 border-top d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span>Saving updates…</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle fs-5"></i>
                    <span>Save Profile Changes & Documents</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-light rounded-pill px-3"
                onClick={() => setEditing(false)}
                disabled={busy}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : (
        /* NORMAL DASHBOARD VIEW */
        <div className="row g-4 mt-1">
          <div className="col-lg-7">
            <section className="card p-4 h-100 shadow-sm border-0 rounded-4">
              <div className="d-flex justify-content-between align-items-center gap-2 mb-4 flex-wrap">
                <h2 className="h5 mb-0 fw-bold">Internship & Candidate Details</h2>
                <Status value={data.status} />
              </div>

              <dl className="details-grid">
                {[
                  ["Candidate Name", data.full_name],
                  ["Category / Role", data.candidate_type_display || "College Intern"],
                  [
                    data.candidate_type === "SCHOOL_STUDENT"
                      ? "School Name"
                      : data.candidate_type === "COLLEGE_COMPLETED"
                      ? "Graduated College"
                      : "College",
                    data.college_name,
                  ],
                  [
                    data.candidate_type === "SCHOOL_STUDENT"
                      ? "Board / Stream"
                      : "Department",
                    data.department,
                  ],
                  [
                    data.candidate_type === "SCHOOL_STUDENT"
                      ? "Class / Standard"
                      : data.candidate_type === "COLLEGE_COMPLETED"
                      ? "Qualification / Degree"
                      : "Course / Degree",
                    data.course,
                  ],
                  [
                    data.candidate_type === "SCHOOL_STUDENT"
                      ? "School Roll Number"
                      : data.candidate_type === "COLLEGE_COMPLETED"
                      ? "Member / Reg ID"
                      : "Register Number",
                    data.register_number,
                  ],
                  ["Gender", data.gender || "MALE"],
                  ["Internship Mode", data.internship_mode || "Offline"],
                  ["Branch / Location", data.branch || "100ft"],
                  ["Reporting Time", data.reporting_time || "11:00 AM"],
                  ["Reporting Venue", getVenue(data.branch)],
                  ["Mobile Number", data.mobile_number || "Not provided"],
                  ["Project", data.project_name],
                  ["Start Date (Joining)", dateLabel(data.start_date)],
                  ["End Date", data.end_date ? dateLabel(data.end_date) : "Pending admin review"],
                  ["Program Duration", data.duration || "15 Days Internship Program"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              {/* Uploaded Documents Preview Section for Student */}
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0 text-secondary text-uppercase tracking-wide">
                    <i className="bi bi-shield-check me-2 text-primary"></i>Your Uploaded Documents
                  </h3>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-semibold"
                    onClick={() => {
                      setEditing(true);
                      setEditValues({ ...data });
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>Update Docs
                  </button>
                </div>

                <div className="row g-3">
                  {/* ID Proof Card */}
                  <div className="col-sm-6">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-secondary">
                          <i className="bi bi-person-badge me-1"></i> {docTitle}
                        </span>
                        {collegeIdUrl && (
                          <span className="badge text-bg-success" style={{ fontSize: "0.72rem" }}>
                            Attached
                          </span>
                        )}
                      </div>

                      {collegeIdUrl ? (
                        isPdf ? (
                          <div className="text-center py-3 bg-white border rounded">
                            <i className="bi bi-file-earmark-pdf-fill text-danger fs-2 d-block mb-1"></i>
                            <span className="small fw-semibold d-block mb-2">ID Proof Document (PDF)</span>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline-primary btn-sm"
                              onClick={() =>
                                setViewDoc({
                                  title: "College ID Card (PDF)",
                                  url: collegeIdUrl,
                                  isPdf: true,
                                })
                              }
                            >
                              <i className="bi bi-eye me-1"></i> View PDF
                            </button>
                          </div>
                        ) : (
                          <div
                            className="bg-white border rounded p-1 text-center"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setViewDoc({
                                title: docTitle,
                                url: collegeIdUrl,
                                isPdf: false,
                              })
                            }
                          >
                            <img
                              src={collegeIdUrl}
                              alt={docTitle}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.parentElement?.querySelector(".id-fallback");
                                if (fallback) fallback.style.display = "block";
                              }}
                              style={{
                                maxHeight: "110px",
                                maxWidth: "100%",
                                objectFit: "contain",
                                borderRadius: "4px",
                              }}
                            />
                            <div className="id-fallback text-center py-2" style={{ display: "none" }}>
                              <i className="bi bi-file-earmark-image text-muted fs-3 d-block mb-1"></i>
                              <small className="text-secondary d-block">ID document image attached</small>
                            </div>
                            <div className="small text-primary mt-1">
                              <i className="bi bi-zoom-in me-1"></i> Click to enlarge
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-3 text-muted">
                          <i className="bi bi-exclamation-circle text-warning fs-3 d-block mb-1"></i>
                          <small>No ID document attached yet.</small>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selfie Photo Card */}
                  <div className="col-sm-6">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-secondary">
                          <i className="bi bi-camera me-1"></i> Selfie Photo
                        </span>
                        {selfieUrl && (
                          <span className="badge text-bg-success" style={{ fontSize: "0.72rem" }}>
                            Attached
                          </span>
                        )}
                      </div>

                      {selfieUrl ? (
                        <div
                          className="bg-white border rounded p-1 text-center"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setViewDoc({
                              title: "Candidate Selfie Photo",
                              url: selfieUrl,
                              isPdf: false,
                            })
                          }
                        >
                          <img
                            src={selfieUrl}
                            alt="Candidate Selfie"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.parentElement?.querySelector(".selfie-fallback");
                              if (fallback) fallback.style.display = "block";
                            }}
                            style={{
                              height: "110px",
                              width: "90px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                          <div className="selfie-fallback text-center py-2" style={{ display: "none" }}>
                            <i className="bi bi-person-bounding-box text-muted fs-3 d-block mb-1"></i>
                            <small className="text-secondary d-block">Selfie photo attached</small>
                          </div>
                          <div className="small text-primary mt-1">
                            <i className="bi bi-zoom-in me-1"></i> Click to enlarge
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3 text-muted">
                          <i className="bi bi-person-x text-warning fs-3 d-block mb-1"></i>
                          <small>No selfie photo attached yet.</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-lg-5 d-flex flex-column gap-4">
            {/* APPOINTMENT LETTER CARD */}
            <section className="card p-4 shadow-sm border-0 rounded-4">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
                  style={{ width: "46px", height: "46px", fontSize: "1.4rem" }}
                >
                  <i className="bi bi-file-earmark-text-fill"></i>
                </div>
                {["APPROVED", "IN_PROGRESS", "COMPLETED", "CERTIFICATE_ISSUED"].includes(data.status) ? (
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold">
                    <i className="bi bi-check2-circle me-1"></i>Approved & Issued
                  </span>
                ) : (
                  <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill fw-semibold">
                    <i className="bi bi-clock-history me-1"></i>Pending Approval
                  </span>
                )}
              </div>

              <h2 className="h5 fw-bold mb-1">Appointment Letter</h2>
              <p className="text-secondary small mb-3">
                {["APPROVED", "IN_PROGRESS", "COMPLETED", "CERTIFICATE_ISSUED"].includes(data.status)
                  ? "Your official selection and appointment letter is ready. You can view or download the high-resolution PDF document below."
                  : "Your application is under administrative review. Your official appointment letter will be unlocked here once approved."}
              </p>

              <div className="bg-light rounded-3 p-3 mb-3 border">
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="text-secondary">Program Domain:</span>
                  <span className="fw-semibold text-dark text-end ms-2">{data.project_name || "Artificial Intelligence and Machine Learning"}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="text-secondary">Internship Mode:</span>
                  <span className="fw-semibold text-dark">{data.internship_mode || "Offline"}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="text-secondary">Reporting Time:</span>
                  <span className="fw-semibold text-dark">{data.reporting_time || "11:00 AM"}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span className="text-secondary">Joining Date:</span>
                  <span className="fw-semibold text-dark">{dateLabel(data.start_date)}</span>
                </div>
              </div>

              {["APPROVED", "IN_PROGRESS", "COMPLETED", "CERTIFICATE_ISSUED"].includes(data.status) ? (
                <div className="d-flex flex-column gap-2 mt-auto">
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill py-2 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    onClick={handleOpenAppointmentLetter}
                    disabled={loadingLetter}
                  >
                    {loadingLetter ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>Generating Letter…</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-file-earmark-pdf-fill fs-5"></i>
                        <span>View Appointment Letter (PDF)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-primary rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    onClick={handleDownloadAppointmentLetter}
                    disabled={loadingLetter}
                  >
                    <i className="bi bi-download"></i>
                    <span>Download PDF</span>
                  </button>
                </div>
              ) : (
                <button className="btn btn-secondary rounded-pill py-2 w-100" disabled>
                  <i className="bi bi-lock-fill me-1"></i> Available After Approval
                </button>
              )}
            </section>

            {/* CERTIFICATE CARD */}
            <section className="card p-4 shadow-sm border-0 rounded-4">
              <div className="certificate-icon">
                <i aria-hidden="true" className="bi bi-patch-check" />
              </div>
              <h2 className="h4 mt-3">Your certificate</h2>
              {data.certificate ? (
                <>
                  <p>
                    {data.certificate.status === "VALID"
                      ? "Congratulations! Your internship certificate is ready."
                      : "Your certificate has been revoked. Please contact the Wingroo team."}
                  </p>
                  <p className="mb-2">
                    <strong>{data.certificate.certificate_id}</strong>
                  </p>
                  <p className="text-secondary">
                    Issued {dateLabel(data.certificate.issue_date)} ·{" "}
                    <Status value={data.certificate.status} />
                  </p>
                  <CertificateActions cert={data.certificate} />
                </>
              ) : (
                <>
                  <p className="text-secondary">
                    Your internship is currently in progress. Your certificate
                    will become available after successful completion and
                    approval.
                  </p>
                  <button className="btn btn-secondary mt-auto" disabled>
                    Certificate not yet available
                  </button>
                </>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Document Lightbox Modal */}
      {viewDoc && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1055 }}
          onClick={() => setViewDoc(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content shadow-lg border-0 rounded-3 overflow-hidden">
              <div className="modal-header py-2 px-3 bg-light">
                <h5 className="modal-title h6 mb-0 fw-bold">{viewDoc.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewDoc(null)}
                />
              </div>
              <div
                className="modal-body p-3 text-center bg-dark d-flex justify-content-center align-items-center"
                style={{ minHeight: "350px" }}
              >
                {viewDoc.isPdf ? (
                  <iframe
                    src={viewDoc.url}
                    title={viewDoc.title}
                    style={{ width: "100%", height: "550px", border: "none" }}
                  />
                ) : (
                  <img
                    src={viewDoc.url}
                    alt={viewDoc.title}
                    style={{
                      maxHeight: "75vh",
                      maxWidth: "100%",
                      objectFit: "contain",
                      borderRadius: "6px",
                    }}
                  />
                )}
              </div>
              <div className="modal-footer py-2 px-3 bg-light d-flex justify-content-between">
                <div className="d-flex gap-2">
                  <a
                    href={viewDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i> Open Full in New Tab
                  </a>
                  {viewDoc.downloadName && (
                    <a
                      href={viewDoc.url}
                      download={viewDoc.downloadName}
                      className="btn btn-sm btn-primary"
                    >
                      <i className="bi bi-download me-1"></i> Download PDF
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setViewDoc(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
