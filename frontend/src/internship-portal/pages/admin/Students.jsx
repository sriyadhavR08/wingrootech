import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, errorText, pdfBlob } from "../../services/api";
import {
  Loading,
  Notice,
  Status,
  Pagination,
  dateLabel,
} from "../../components/Common";
import { PROJECT_OPTIONS, BRANCH_OPTIONS, DURATION_OPTIONS } from "../../components/StudentFields";
export default function Students() {
  const [filters, setFilters] = useState({}),
    [query, setQuery] = useState({}),
    [page, setPage] = useState(1),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [successMsg, setSuccessMsg] = useState(""),
    [actionBusy, setActionBusy] = useState({});
  const location = useLocation();
  const prefix = location.pathname.startsWith("/internship") ? "/internship" : "";

  async function handleApprove(studentId) {
    if (!studentId) return;
    setActionBusy((prev) => ({ ...prev, [studentId]: true }));
    setError("");
    setSuccessMsg("");
    try {
      const res = await api.post(`/admin/students/${studentId}/approve/`);
      setSuccessMsg(res.data?.message || "Candidate approved successfully! Official appointment letter sent.");
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map((cand) =>
            cand.id === studentId
              ? { ...cand, ...(res.data?.student || {}), status: "APPROVED" }
              : cand
          ),
        };
      });
    } catch (e) {
      setError(await errorText(e));
    } finally {
      setActionBusy((prev) => ({ ...prev, [studentId]: false }));
    }
  }

  async function handleReject(studentId) {
    if (!studentId) return;
    if (!window.confirm("Are you sure you want to reject this candidate's registration?")) return;
    setActionBusy((prev) => ({ ...prev, [studentId]: true }));
    setError("");
    setSuccessMsg("");
    try {
      const res = await api.post(`/admin/students/${studentId}/reject/`);
      setSuccessMsg(res.data?.message || "Candidate registration has been rejected. No email sent.");
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map((cand) =>
            cand.id === studentId
              ? { ...cand, ...(res.data?.student || {}), status: "REJECTED" }
              : cand
          ),
        };
      });
    } catch (e) {
      setError(await errorText(e));
    } finally {
      setActionBusy((prev) => ({ ...prev, [studentId]: false }));
    }
  }

  async function handleResendLetter(studentId) {
    if (!studentId) return;
    setActionBusy((prev) => ({ ...prev, [studentId]: true }));
    setError("");
    setSuccessMsg("");
    try {
      const res = await api.post(`/admin/students/${studentId}/resend-letter/`);
      setSuccessMsg(res.data?.message || "Appointment letter has been resent successfully.");
    } catch (e) {
      setError(await errorText(e));
    } finally {
      setActionBusy((prev) => ({ ...prev, [studentId]: false }));
    }
  }

  async function handleViewLetter(studentId) {
    if (!studentId) return;
    setError("");
    try {
      const blob = await pdfBlob(`/admin/students/${studentId}/appointment-letter/`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      setError(await errorText(e));
    }
  }

  useEffect(() => {
    let live = true;
    setData(null);
    setError("");
    api
      .get("/admin/students/", { params: { ...query, page } })
      .then((r) => {
        if (live) setData(r.data);
      })
      .catch(async (e) => {
        const message = await errorText(e);
        if (live) setError(message);
      });
    return () => {
      live = false;
    };
  }, [query, page]);
  return (
    <>
      <div className="eyebrow">MANAGEMENT</div>
      <h1 className="mt-2">
        {location.pathname.endsWith("internships") ? "Internships" : "Candidates"}
      </h1>
      <p className="text-secondary">
        Review details and guide each internship through approval.
      </p>
      <section className="card p-4">
        <form
          className="row g-3 mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery({ ...filters });
          }}
        >
          <div className="col-lg-3">
            <label className="form-label" htmlFor="search">
              Search candidates
            </label>
            <input
              id="search"
              className="form-control"
              placeholder="Name, register number or email"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <div className="col-lg-3">
            <label className="form-label" htmlFor="project">
              Project
            </label>
            <select
              id="project"
              className="form-select"
              value={filters.project_name || ""}
              onChange={(e) =>
                setFilters({ ...filters, project_name: e.target.value })
              }
            >
              <option value="">All projects</option>
              {PROJECT_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-3">
            <label className="form-label" htmlFor="branch">
              Branch / Location
            </label>
            <select
              id="branch"
              className="form-select"
              value={filters.branch || ""}
              onChange={(e) =>
                setFilters({ ...filters, branch: e.target.value })
              }
            >
              <option value="">All branches</option>
              {BRANCH_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-3">
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="form-select"
              value={filters.status || ""}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All statuses</option>
              {[
                "REGISTERED",
                "IN_PROGRESS",
                "COMPLETED",
                "CERTIFICATE_ISSUED",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="col-lg-4">
            <label className="form-label" htmlFor="duration">
              Program Duration
            </label>
            <select
              id="duration"
              className="form-select"
              value={filters.duration || ""}
              onChange={(e) =>
                setFilters({ ...filters, duration: e.target.value })
              }
            >
              <option value="">All Durations</option>
              {DURATION_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-4">
            <label className="form-label" htmlFor="candidate_type">
              Candidate Type
            </label>
            <select
              id="candidate_type"
              className="form-select"
              value={filters.candidate_type || ""}
              onChange={(e) =>
                setFilters({ ...filters, candidate_type: e.target.value })
              }
            >
              <option value="">All Candidate Types</option>
              <option value="COLLEGE_INTERN">College Intern</option>
              <option value="SCHOOL_STUDENT">School Candidate Intern</option>
              <option value="COLLEGE_COMPLETED">College Completed Candidate Intern</option>
            </select>
          </div>
          {["start_date", "end_date"].map((key) => (
            <div className="col-md-4" key={key}>
              <label className="form-label" htmlFor={key}>
                {key.replace("_", " ")}
              </label>
              <input
                id={key}
                type="date"
                className="form-control"
                value={filters[key] || ""}
                onChange={(e) =>
                  setFilters({ ...filters, [key]: e.target.value })
                }
              />
            </div>
          ))}
          <div className="col-md-4 d-flex align-items-end gap-2">
            <button className="btn btn-primary">Apply filters</button>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setFilters({});
                setQuery({});
                setPage(1);
              }}
            >
              Clear
            </button>
          </div>
        </form>
        <Notice message={error} />
        <Notice message={successMsg} type="success" />
        {!data && !error ? (
          <Loading />
        ) : (
          data && (
            <>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      {[
                        "Candidate / Category",
                        "Branch",
                        "Institution / College",
                        "Project",
                        "Dates",
                        "Status & Approval",
                        "Certificate",
                        "Actions",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            <strong>{s.full_name}</strong>
                            {s.candidate_type === "SCHOOL_STUDENT" && (
                              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1 px-2" style={{ fontSize: "0.72rem" }}>
                                <i className="bi bi-backpack2 me-1"></i> School Intern
                              </span>
                            )}
                            {s.candidate_type === "COLLEGE_COMPLETED" && (
                              <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle py-1 px-2" style={{ fontSize: "0.72rem" }}>
                                <i className="bi bi-briefcase me-1"></i> Completed Intern
                              </span>
                            )}
                            {(!s.candidate_type || s.candidate_type === "COLLEGE_INTERN") && (
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2" style={{ fontSize: "0.72rem" }}>
                                <i className="bi bi-mortarboard me-1"></i> College Intern
                              </span>
                            )}
                          </div>
                          <small className="d-block text-secondary">
                            {s.register_number}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-dark border px-2 py-1">
                            <i className="bi bi-geo-alt me-1 text-primary"></i>
                            {s.branch || "100ft"}
                          </span>
                        </td>
                        <td>{s.college_name}</td>
                        <td>{s.project_name}</td>
                        <td className="text-nowrap">
                          {dateLabel(s.start_date)}
                          <small className="d-block">
                            to {dateLabel(s.end_date)}
                          </small>
                        </td>
                        <td>
                          {(!s.status || s.status === "REGISTERED" || s.status === "PENDING_APPROVAL" || s.status === "PENDING") ? (
                            <div className="d-flex flex-column gap-1">
                              <span className="badge text-bg-warning text-dark mb-1 d-inline-flex align-items-center gap-1" style={{ width: "fit-content", fontSize: "0.75rem" }}>
                                <i className="bi bi-clock-history"></i> Pending Approval
                              </span>
                              <div className="d-flex gap-1">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success px-2 py-1 d-flex align-items-center gap-1 shadow-sm"
                                  title="Approve candidate and send official appointment letter"
                                  onClick={() => handleApprove(s.id)}
                                  disabled={actionBusy[s.id]}
                                  style={{ fontSize: "0.78rem" }}
                                >
                                  {actionBusy[s.id] ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <>
                                      <i className="bi bi-check-circle-fill"></i> Approve
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger px-2 py-1 d-flex align-items-center gap-1"
                                  title="Reject registration"
                                  onClick={() => handleReject(s.id)}
                                  disabled={actionBusy[s.id]}
                                  style={{ fontSize: "0.78rem" }}
                                >
                                  <i className="bi bi-x-circle"></i> Reject
                                </button>
                              </div>
                            </div>
                          ) : s.status === "APPROVED" || s.status === "IN_PROGRESS" ? (
                            <div className="d-flex flex-column gap-1">
                              <span className="badge text-bg-success mb-1 d-inline-flex align-items-center gap-1" style={{ width: "fit-content", fontSize: "0.75rem" }}>
                                <i className="bi bi-check-circle-fill"></i> {s.status === "APPROVED" ? "Approved" : "In Progress"}
                              </span>
                              <div className="d-flex gap-1 flex-wrap">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: "0.72rem", padding: "2px 6px" }}
                                  title="Resend Appointment Letter Email"
                                  onClick={() => handleResendLetter(s.id)}
                                  disabled={actionBusy[s.id]}
                                >
                                  {actionBusy[s.id] ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <>
                                      <i className="bi bi-envelope-check"></i> Resend Email
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: "0.72rem", padding: "2px 6px" }}
                                  title="Download / View Appointment Letter PDF"
                                  onClick={() => handleViewLetter(s.id)}
                                >
                                  <i className="bi bi-file-earmark-pdf"></i> PDF
                                </button>
                              </div>
                            </div>
                          ) : s.status === "REJECTED" ? (
                            <div className="d-flex flex-column gap-1">
                              <span className="badge text-bg-danger mb-1 d-inline-flex align-items-center gap-1" style={{ width: "fit-content", fontSize: "0.75rem" }}>
                                <i className="bi bi-x-circle-fill"></i> Rejected
                              </span>
                              <button
                                type="button"
                                className="btn btn-outline-success d-inline-flex align-items-center gap-1"
                                style={{ fontSize: "0.72rem", padding: "2px 6px", width: "fit-content" }}
                                title="Re-approve candidate and send appointment letter"
                                onClick={() => handleApprove(s.id)}
                                disabled={actionBusy[s.id]}
                              >
                                Approve Now
                              </button>
                            </div>
                          ) : (
                            <Status value={s.status} />
                          )}
                        </td>
                        <td>
                          <Status value={s.certificate?.status} />
                        </td>
                        <td>
                          <Link
                            className="btn btn-sm btn-outline-primary text-nowrap"
                            to={`${prefix}/admin/students/${s.id}`}
                          >
                            View / Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!data.results.length && (
                  <p className="text-center py-4 text-secondary">
                    No candidates match these filters.
                  </p>
                )}
              </div>
              <Pagination page={page} count={data.count} onChange={setPage} />
            </>
          )
        )}
      </section>
    </>
  );
}
