import { useEffect, useState } from "react";
import { api, errorText } from "../../services/api";
import { Loading, Notice, Status, dateLabel } from "../../components/Common";
import CertificateActions from "../../components/CertificateActions";
export default function StudentDashboard() {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/student/profile/")
      .then((r) => setData(r.data))
      .catch(async (e) => setError(await errorText(e)));
  }, []);
  if (error) return <Notice message={error} />;
  if (!data) return <Loading />;
  return (
    <>
      <div className="eyebrow">CANDIDATE WORKSPACE</div>
      <h1 className="mt-2">Welcome, {data.full_name}</h1>
      <p className="text-secondary">
        Your internship journey, all in one place.
      </p>
      <div className="row g-4 mt-2">
        <div className="col-lg-7">
          <section className="card p-4 h-100">
            <div className="d-flex justify-content-between gap-2 mb-4">
              <h2 className="h5 mb-0">Internship details</h2>
              <Status value={data.status} />
            </div>
            <dl className="details-grid">
              {[
                ["Candidate Name", data.full_name],
                ["Candidate Category", data.candidate_type === "PROJECT_CLIENT" ? "Project Client Candidate" : (data.candidate_type_display || "Internship & Event Candidate")],
                [
                  data.candidate_type === "PROJECT_CLIENT"
                    ? "Client / Organization"
                    : "College / University",
                  data.college_name,
                ],
                [
                  data.candidate_type === "PROJECT_CLIENT"
                    ? "Domain / Tech Stack"
                    : "Department / Stream",
                  data.department,
                ],
                [
                  data.candidate_type === "PROJECT_CLIENT"
                    ? "Project Role / Track"
                    : "Course / Degree",
                  data.course,
                ],
                [
                  data.candidate_type === "PROJECT_CLIENT"
                    ? "Client Project ID / Reg No"
                    : "Register Number",
                  data.register_number,
                ],
                [data.candidate_type === "PROJECT_CLIENT" ? "Live Project Name" : "Internship Project", data.project_name],
                ["Start date", dateLabel(data.start_date)],
                ["End date", dateLabel(data.end_date)],
                ["Duration", `${data.duration_days} days`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <div className="col-lg-5">
          <section className="card p-4 h-100">
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
    </>
  );
}
