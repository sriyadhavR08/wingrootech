import { useState, useRef, useEffect } from "react";
import { Field } from "./Common";
import { resolveMediaUrl } from "../services/api";

// Client-side image resize helper to keep payloads lightweight & fast
function resizeImage(file, maxWidth = 900, maxHeight = 900, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width || 480;
        canvas.height = height || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
}

export default function StudentFields({ values, onChange, account = false }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  async function handleFileUpload(field, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file, field === "selfie_photo" ? 640 : 1200);
      if (resized) {
        onChange({ target: { name: field, value: resized } });
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ target: { name: field, value: reader.result } });
      };
      reader.readAsDataURL(file);
    }
  }

  // Callback ref ensures video element is assigned stream immediately upon mounting
  const handleVideoRef = (videoEl) => {
    videoRef.current = videoEl;
    if (videoEl && streamRef.current) {
      videoEl.srcObject = streamRef.current;
      videoEl.play().catch(() => {});
    }
  };

  async function startCamera() {
    setCameraError("");
    setCameraLoading(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser environment. Please select a photo file directly.");
      }
      let stream = null;
      try {
        // First try mobile front camera constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
      } catch {
        // Fallback for laptop / desktop webcams without facingMode support
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Camera access error:", err);
      let msg = "Could not access camera. Please choose an image file from your device.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission denied. Please allow camera access in browser or choose a file.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No camera found on your system. Please select a photo file.";
      }
      setCameraError(msg);
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function snapSelfie() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    onChange({ target: { name: "selfie_photo", value: dataUrl } });
    stopCamera();
  }

  const candType = values.candidate_type || "INTERNSHIP_EVENT";

  const candidateCategories = [
    {
      key: "PROJECT_CLIENT",
      label: "Project Client Candidate",
      subtext: "Candidate engaged in live client projects, software development & client deliverables",
      icon: "bi-laptop",
    },
    {
      key: "INTERNSHIP_EVENT",
      label: "Internship & Event Candidate",
      subtext: "Candidate attending college internship programs, technical workshops & tech events",
      icon: "bi-mortarboard-fill",
    },
  ];

  const configByType = {
    PROJECT_CLIENT: {
      academicTitle: "Client Project & Professional Information",
      collegeLabel: "Client / Organization / College",
      collegePlaceholder: "Enter client company, organization or college name",
      deptLabel: "Domain / Tech Stack",
      deptPlaceholder: "Enter domain (e.g. Full Stack Web, Mobile App, AI/ML)",
      courseLabel: "Project Role / Track",
      coursePlaceholder: "Enter role (e.g. Client Project Intern, Associate)",
      regLabel: "Client Project ID / Reference No",
      regPlaceholder: "Enter client project ID, reference or roll number",
      projectTitle: "Live Client Project Information",
      projectLabel: "Project Title",
      idDocLabel: "Client / Identity Document (Aadhaar, ID card, or Offer letter)",
      idDocHelp: "Upload clear photo or document (JPG, PNG, PDF) of ID card, Aadhaar, or authorization letter.",
      idDocBadge: "Identity Proof Attached",
    },
    INTERNSHIP_EVENT: {
      academicTitle: "College & Academic Information",
      collegeLabel: "College / University Name",
      collegePlaceholder: "Enter your college or university name",
      deptLabel: "Department / Stream",
      deptPlaceholder: "Enter your department (e.g. Computer Science, IT, ECE)",
      courseLabel: "Course / Degree",
      coursePlaceholder: "Enter your course / degree (e.g. B.E, B.Tech, MCA)",
      regLabel: "College Register / Roll Number",
      regPlaceholder: "Enter your college register or roll number",
      projectTitle: "Internship & Event Project Information",
      projectLabel: "Assigned Project Name",
      idDocLabel: "College ID Card Photo / Bonafide",
      idDocHelp: "Upload clear photo or scan (JPG, PNG, or PDF) of your College ID card.",
      idDocBadge: "College ID Card Attached",
    },
    // Backward compatibility for existing records
    COLLEGE_INTERN: {
      academicTitle: "College & Academic Information",
      collegeLabel: "College Name",
      collegePlaceholder: "Enter your college name",
      deptLabel: "Department",
      deptPlaceholder: "Enter your department",
      courseLabel: "Course / Degree",
      coursePlaceholder: "Enter your course / degree",
      regLabel: "College Register / Roll Number",
      regPlaceholder: "Enter your college register / roll number",
      projectTitle: "Project Information",
      projectLabel: "Project Name",
      idDocLabel: "College ID Card Photo / Document",
      idDocHelp: "Upload clear photo or scan (JPG, PNG, or PDF) of your College ID card.",
      idDocBadge: "College ID Card Attached",
    },
    SCHOOL_STUDENT: {
      academicTitle: "School & Academic Information",
      collegeLabel: "School Name",
      collegePlaceholder: "Enter your school name",
      deptLabel: "Board / Stream",
      deptPlaceholder: "Enter your board / stream (e.g. CBSE / State Board)",
      courseLabel: "Class / Standard",
      coursePlaceholder: "Enter your class / standard (e.g. 11th / 12th)",
      regLabel: "School Roll Number / Candidate ID",
      regPlaceholder: "Enter your school roll number / candidate ID",
      projectTitle: "Project Information",
      projectLabel: "Project Name",
      idDocLabel: "School ID Card / Student Proof",
      idDocHelp: "Upload clear photo or scan of your School ID card.",
      idDocBadge: "School ID Proof Attached",
    },
    COLLEGE_COMPLETED: {
      academicTitle: "Education & Degree Information",
      collegeLabel: "Graduated College / University",
      collegePlaceholder: "Enter your graduated college / university name",
      deptLabel: "Department / Specialization",
      deptPlaceholder: "Enter your department / specialization",
      courseLabel: "Highest Qualification / Degree",
      coursePlaceholder: "Enter your highest qualification / degree",
      regLabel: "Degree Roll No / Registration ID",
      regPlaceholder: "Enter your roll number / registration ID",
      projectTitle: "Project Information",
      projectLabel: "Project Name",
      idDocLabel: "ID Proof (Aadhaar / Degree Certificate / Govt ID)",
      idDocHelp: "Upload clear photo or scan of ID proof.",
      idDocBadge: "ID Document Attached",
    },
  };

  const currentConfig = configByType[candType] || configByType.INTERNSHIP_EVENT || configByType.COLLEGE_INTERN;

  const sections = [
    {
      title: "Personal Information",
      fields: [
        ["full_name", "Full name", "text", 120, "Enter your name"],
        ["gender", "Gender", "select", null, ""],
        ["email", "Email", "email", null, "Enter your email"],
        ["mobile_number", "Mobile number", "tel", 16, "Enter your mobile number"],
      ],
    },
    {
      title: currentConfig.academicTitle,
      fields: [
        ["college_name", currentConfig.collegeLabel, "text", 200, currentConfig.collegePlaceholder],
        ["department", currentConfig.deptLabel, "text", 120, currentConfig.deptPlaceholder],
        ["course", currentConfig.courseLabel, "text", 100, currentConfig.coursePlaceholder],
        ["register_number", currentConfig.regLabel, "text", 60, currentConfig.regPlaceholder],
      ],
    },
    {
      title: currentConfig.projectTitle,
      fields: account
        ? [
            ["project_name", currentConfig.projectLabel, "text", 150, "Enter project name"],
            ["start_date", "Start date", "date", null, ""],
          ]
        : [
            ["project_name", currentConfig.projectLabel, "text", 150, "Enter project name"],
            ["start_date", "Start date", "date", null, ""],
            ["end_date", "End date (Admin set)", "date", null, ""],
          ],
    },
  ];

  return (
    <>
      {/* Candidate Type / Category Selection */}
      <section className="form-section">
        <h2 className="h5">
          <span className="section-number">01</span>Candidate Category / Role
        </h2>
        <p className="form-text text-secondary mb-3">
          Choose your registration category to customize your profile and certificate details:
        </p>

        <div className="candidate-type-grid">
          {candidateCategories.map((cat) => {
            const isSelected = candType === cat.key;
            return (
              <div
                key={cat.key}
                className={`candidate-type-card ${isSelected ? "active" : ""}`}
                onClick={() => onChange({ target: { name: "candidate_type", value: cat.key } })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange({ target: { name: "candidate_type", value: cat.key } });
                  }
                }}
              >
                {isSelected && (
                  <i className="bi bi-check-circle-fill active-check-icon"></i>
                )}
                <div className="card-icon-wrap">
                  <i className={`bi ${cat.icon}`}></i>
                </div>
                <div>
                  <div className="card-title-text">{cat.label}</div>
                  <div className="card-subtext">{cat.subtext}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {sections.map(({ title, fields }, index) => (
        <section className="form-section" key={title}>
          <h2 className="h5">
            <span className="section-number">0{index + 2}</span>
            {title}
          </h2>
          <div className="row g-3">
            {fields.map(([name, label, type, maxLength, placeholder]) => (
              <Field
                key={name}
                name={name}
                label={label}
                type={type === "select" ? "text" : type}
                maxLength={maxLength}
                placeholder={placeholder}
                value={values[name]}
                onChange={onChange}
                options={
                  name === "gender"
                    ? [
                        ["FEMALE", "Female"],
                        ["MALE", "Male"],
                      ]
                    : undefined
                }
                pattern={name === "mobile_number" ? "[+]?[0-9]{10,15}" : undefined}
                min={name === "end_date" ? values.start_date : undefined}
              />
            ))}
          </div>
          {index === 2 && account && (
            <p className="form-text mt-3 mb-0 text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Note: Internship End date will be verified and fixed by the Wingroo Administrator.
            </p>
          )}
        </section>
      ))}

      {/* Identity & Verification Documents Section */}
      <section className="form-section">
        <h2 className="h5">
          <span className="section-number">05</span>Identity & Verification Documents
        </h2>
        <p className="form-text text-secondary mb-3">
          Upload your {currentConfig.idDocLabel} and a selfie photo for certificate verification and authenticity.
        </p>
        <div className="row g-3">
          {/* ID Card / Document Upload */}
          <div className="col-md-6">
            <label className="form-label fw-semibold" htmlFor="field-college-id">
              {currentConfig.idDocLabel} {account && <span className="text-danger">*</span>}
            </label>
            <input
              id="field-college-id"
              type="file"
              accept="image/*,.pdf"
              className="form-control"
              onChange={(e) => handleFileUpload("college_id_card", e)}
            />
            <small className="form-text text-muted d-block mt-1">
              {currentConfig.idDocHelp}
            </small>

            {values.college_id_card && (
              <div className="mt-2 p-2 border rounded bg-light d-flex align-items-center gap-3">
                {typeof values.college_id_card === "string" &&
                !values.college_id_card.toLowerCase().includes(".pdf") ? (
                  <img
                    src={resolveMediaUrl(values.college_id_card)}
                    alt="ID Document Preview"
                    style={{ height: "64px", objectFit: "cover", borderRadius: "4px" }}
                  />
                ) : (
                  <i className="bi bi-file-earmark-check text-primary fs-3"></i>
                )}

                <div>
                  <span className="badge text-bg-success">
                    <i className="bi bi-check-circle me-1"></i> {currentConfig.idDocBadge}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger d-block p-0 mt-1 text-decoration-none"
                    onClick={() => {
                      onChange({ target: { name: "college_id_card", value: null } });
                      const el = document.getElementById("field-college-id");
                      if (el) el.value = "";
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selfie Photo Upload / Camera Capture */}
          <div className="col-md-6">
            <label className="form-label fw-semibold" htmlFor="field-selfie-file">
              Selfie Photo {account && <span className="text-danger">*</span>}
            </label>
            <input
              id="field-selfie-file"
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => handleFileUpload("selfie_photo", e)}
            />
            <div className="d-flex justify-content-between align-items-center mt-1 flex-wrap gap-2">
              <small className="form-text text-muted">
                Upload clear image file (JPG, PNG) or take live selfie.
              </small>
              {!cameraActive ? (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  onClick={startCamera}
                  disabled={cameraLoading}
                  style={{ fontSize: "0.82rem", padding: "2px 10px" }}
                >
                  <i className="bi bi-camera-fill"></i>
                  {cameraLoading ? "Starting Camera…" : "Take Live Selfie"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                  onClick={stopCamera}
                  style={{ fontSize: "0.82rem", padding: "2px 10px" }}
                >
                  <i className="bi bi-x-circle"></i> Close Camera
                </button>
              )}
            </div>

            {cameraError && (
              <div className="alert alert-warning py-2 px-3 small my-2 d-flex align-items-start gap-2">
                <i className="bi bi-exclamation-triangle-fill mt-1 text-warning"></i>
                <div>
                  <strong>Camera notice:</strong> {cameraError}
                  <div className="mt-1 text-muted">You can choose an image file from your device directly above.</div>
                </div>
              </div>
            )}

            {/* Live Camera View */}
            {cameraActive && (
              <div className="p-3 border rounded bg-dark text-center my-2 shadow-sm position-relative">
                <video
                  ref={handleVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    maxHeight: "260px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    transform: "scaleX(-1)", // Mirror effect for natural selfie preview
                  }}
                />
                <button
                  type="button"
                  className="btn btn-success w-100 mt-2 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={snapSelfie}
                >
                  <i className="bi bi-camera fs-5"></i> Capture Selfie Now
                </button>
              </div>
            )}

            {/* Attached Photo Preview */}
            {values.selfie_photo && (
              <div className="mt-2 p-2 border rounded bg-light d-flex align-items-center gap-3">
                <img
                  src={resolveMediaUrl(values.selfie_photo)}
                  alt="Selfie Preview"
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "3px solid #198754",
                  }}
                />

                <div>
                  <span className="badge text-bg-success mb-1">
                    <i className="bi bi-check-circle me-1"></i> Selfie Attached Successfully
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                      onClick={() => {
                        onChange({ target: { name: "selfie_photo", value: null } });
                        const el = document.getElementById("field-selfie-file");
                        if (el) el.value = "";
                      }}
                    >
                      Remove
                    </button>
                    <span className="text-muted">|</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-primary p-0 text-decoration-none"
                      onClick={() => {
                        startCamera();
                      }}
                    >
                      Retake with Camera
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {account && (
        <section className="form-section">
          <h2 className="h5">
            <span className="section-number">06</span>Account security
          </h2>
          <div className="row g-3">
            <Field
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={values.password}
              onChange={onChange}
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
            />
            <Field
              name="confirm_password"
              label="Confirm password"
              type="password"
              placeholder="Enter confirm password"
              value={values.confirm_password}
              onChange={onChange}
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
            />
          </div>
          <p className="form-text mt-3 mb-0">
            Use at least 6 characters. If you have an existing Wingroo main website account, enter the same password to automatically link your profile.
          </p>
        </section>
      )}
    </>
  );
}
