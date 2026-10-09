import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";
import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/Auth";
import { Loading } from "./components/Common";
import Shell from "./layouts/Shell";
import Home from "./pages/public/Home";
import { Login, Register } from "./pages/public/AuthPages";
import Verify from "./pages/public/Verify";
import StudentDashboard from "./pages/student/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import StudentDetail from "./pages/admin/StudentDetail";
import Certificates from "./pages/admin/Certificates";

function getEffectiveUser(contextUser) {
  if (contextUser) return contextUser;
  try {
    const raw =
      sessionStorage.getItem("wingroo_student_user") ||
      localStorage.getItem("wingroo_student_user") ||
      sessionStorage.getItem("wingroo_admin_user") ||
      localStorage.getItem("wingroo_admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Protected({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const prefix = location.pathname.startsWith("/internship") ? "/internship" : "";
  const effectiveUser = getEffectiveUser(user);

  if (loading && !effectiveUser) return <Loading />;
  if (!effectiveUser) return <Navigate to={`${prefix}/login`} replace />;

  const normUserRole = (effectiveUser.role || "").toUpperCase();
  const targetRole = (role || "").toUpperCase();
  const isStudent = normUserRole === "STUDENT" || normUserRole === "CANDIDATE";
  const isAdmin = normUserRole === "ADMIN";

  if (targetRole === "STUDENT" && !isStudent) {
    return <Navigate to={`${prefix}/admin/dashboard`} replace />;
  }
  if (targetRole === "ADMIN" && !isAdmin) {
    return <Navigate to={`${prefix}/student/dashboard`} replace />;
  }

  return <Outlet />;
}

function PublicOnly() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const prefix = location.pathname.startsWith("/internship") ? "/internship" : "";
  const effectiveUser = getEffectiveUser(user);

  if (loading && !effectiveUser) return <Loading />;
  if (effectiveUser) {
    const isAdmin = (effectiveUser.role || "").toUpperCase() === "ADMIN";
    return (
      <Navigate
        to={isAdmin ? `${prefix}/admin/dashboard` : `${prefix}/student/dashboard`}
        replace
      />
    );
  }
  return <Outlet />;
}

export default function InternshipApp() {
  useEffect(() => {
    const linkId = 'wingroo-bootstrap-styles';
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
      document.head.appendChild(link);
    }
    return () => {
      const el = document.getElementById(linkId);
      if (el) el.remove();
    };
  }, []);
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route element={<PublicOnly />}>
            <Route path="login" element={<Navigate to={`${prefix}/register`} replace />} />
            <Route path="admin-login" element={<Login initialRole="admin" />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="verify" element={<Verify />} />
          <Route path="verify/:token" element={<Verify />} />
          <Route element={<Protected role="STUDENT" />}>
            <Route path="student/dashboard" element={<StudentDashboard />} />
          </Route>
          <Route element={<Protected role="ADMIN" />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/students" element={<Students />} />
            <Route path="admin/internships" element={<Students />} />
            <Route path="admin/students/:id" element={<StudentDetail />} />
            <Route path="admin/certificates" element={<Certificates />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="text-center py-5">
                <h1>Page not found</h1>
                <a href="/internship">Return to Internship Home</a>
              </div>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
