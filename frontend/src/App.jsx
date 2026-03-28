import React, { useContext } from "react";
import Navbar from "./components/Navbar.jsx";
import About from "./components/About.jsx";
import Register from "./components/Register.jsx";
import RecruiterSignUp from "./components/RecruiterSignUp.jsx";
import { Routes, Route, useLocation } from "react-router-dom";
import JobSeekerSignUp from "./components/JobSeekerSignUp.jsx";
import AdminSignUp from "./components/AdminSignUp.jsx";
import Login from "./components/Login.jsx";
import { AuthProvider, AuthContext } from "./components/context/AuthContext";
import Forgot_Password from "./components/Forgot_Password.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

import RecruiterLayout from "./components/recruiters/RecruiterLayout.jsx";
import Recruiterdashboard from "./components/recruiters/Recruiterdashboard.jsx";
import RecruiterProfile from "./components/recruiters/RecruiterProfile.jsx";
import RecruiterNotification from "./components/recruiters/RecruiterNotification.jsx";
import PostJob from "./components/recruiters/PostJob.jsx";
import MyJobs from "./components/recruiters/MyJobs.jsx";
import RecruiterApplicants from "./components/recruiters/RecruiterApplicants.jsx";
import AllRecruiterApplicants from "./components/recruiters/AllRecruiterApplicants.jsx";
import Home from "./components/Home.jsx";

// JOBSEEKER IMPORTS
import JobSeekerLayout from "./components/jobseekers/JobSeekerLayout.jsx";
import JobSeekerProfile from "./components/JobSeekerProfile.jsx";
import FindJobs from "./components/jobseekers/FindJobs.jsx";
import MyApplications from "./components/jobseekers/MyApplications.jsx";
import JobSeekerNotifications from "./components/jobseekers/JobSeekerNotifications.jsx";
import JobSeekerDashboard from "./components/jobseekers/JobSeekerDashboard.jsx";
import TrackApplication from "./components/jobseekers/TrackApplication.jsx";
import JobDetails from "./components/JobDetails.jsx";

// ADMIN IMPORTS
import AdminDashboard from "./components/admin/AdminDashboard.jsx";

function MainApp() {

  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/jobseeker") || 
                      location.pathname.startsWith("/recruiter") || 
                      location.pathname.startsWith("/admin");

  return (

    <>
      {/* Hide Navbar totally if a user is logged in (they have sidebars) or on dashboard routes */}
      {!user && !isDashboard && <Navbar />}

      <Routes>
        {/* HOME PAGE */}
        <Route path="/" element={<Home />} />
        <Route path="/homePage" element={<Home />} />

        {/* AUTH ROUTES */}
        <Route path="/admin/register" element={<AdminSignUp />} />
        <Route path="/recruiter/register" element={<RecruiterSignUp />} />
        <Route path="/jobseeker/register" element={<JobSeekerSignUp />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />

        <Route path="/forgot-password" element={<Forgot_Password />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ADMIN PROTECTED ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* RECRUITER PROTECTED ROUTES */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Recruiterdashboard />} />
          <Route path="profile" element={<RecruiterProfile />} />
          <Route path="notifications" element={<RecruiterNotification />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="applicants" element={<AllRecruiterApplicants />} />
          <Route path="job/:jobId/applicants" element={<RecruiterApplicants />} />
          <Route path="job/:jobId" element={<JobDetails />} />
        </Route>

        {/* JOBSEEKER PROTECTED ROUTES */}
        <Route
          path="/jobseeker"
          element={
            <ProtectedRoute role="jobseeker">
              <JobSeekerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<JobSeekerDashboard />} />
          <Route path="dashboard" element={<JobSeekerDashboard />} />
          <Route path="jobs" element={<FindJobs />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="track" element={<TrackApplication />} />
          <Route path="notifications" element={<JobSeekerNotifications />} />
          <Route path="profile" element={<JobSeekerProfile />} />
          <Route path="job/:jobId" element={<JobDetails />} />
        </Route>

      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;