import { ThemeProvider } from "@/components/theme-provider"
import SuperAdminLogin from "@/pages/superadmin/login"
import SuperAdminRegister from "@/pages/superadmin/register"
import SuperAdminSchools from "@/pages/superadmin/schools"
import SuperAdminSchoolDetails from "@/pages/superadmin/school-details"
import { Route, Routes } from "react-router-dom"
import CheckAuth from "./components/common/checkauth"
import AuthLayout from "./components/auth/authlayout"
import SuperAdminDashboard from "./pages/superadmin/dashboard"
import FindSchool from "./pages/find-school"
import LoginSchool from "./pages/login-school"
import SchoolNotFound from "./pages/school-not-found"
import SchoolAdminDashboard from "./pages/school-admin/dashboard"
import SchoolAdminStudents from "./pages/school-admin/students"
import SchoolAdminTeachers from "./pages/school-admin/teachers"
import SchoolAdminClasses from "./pages/school-admin/classes"
import SchoolAdminSubjects from "./pages/school-admin/subjects"
import SchoolAdminResults from "./pages/school-admin/results"
import SchoolAdminSettings from "./pages/school-admin/settings"
import SchoolAdminStudentDetail from "./pages/school-admin/student-detail"
import SchoolAdminCycles from "./pages/school-admin/cycles"
import SchoolAdminPromote from "./pages/school-admin/promote"
import SchoolAdminAnalytics from "./pages/school-admin/analytics"
import SchoolAdminAuthGuard from "./components/common/schooladminauthguard"
import SuperAdminAuthGuard from "./components/common/requireauth"
import TeacherAuthGuard from "./components/common/teacherauthguard"
import TeacherDashboard from "./pages/teacher/dashboard"
import TeacherClasses from "./pages/teacher/classes"
import TeacherResults from "./pages/teacher/results"
import StudentLogin from "./pages/student-login"
import StudentCycles from "./pages/student/student-cycles"
import StudentResultView from "./pages/student/student-result-view"
import NotFoundPage from "./pages/not-found-page"
import UnauthorizedPage from "./pages/unauthorized-page"
import HomePage from "./pages/home"

function App() {

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <main className='flex flex-col p-2 h-svh'>

        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/auth/superadmin" element={<SuperAdminAuthGuard />}>
            <Route path="login" element={<SuperAdminLogin />} />
            <Route path="register" element={<SuperAdminRegister />} />
          </Route>


          <Route path="/auth/school" element={
            <CheckAuth isAuthenticated={false} user={{role: ''}}>
              <AuthLayout />
            </CheckAuth>
          }>
            <Route path="find" element={<FindSchool />} />
            <Route path=":slug/login" element={<LoginSchool />} />
            <Route path=":slug/not-found" element={<SchoolNotFound />} />
          </Route>



          <Route path="/superadmin" element={<SuperAdminAuthGuard />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="schools" element={<SuperAdminSchools />} />
            <Route path="schools/:id" element={<SuperAdminSchoolDetails />} />
          </Route>


          <Route path="/:slug/admin" element={<SchoolAdminAuthGuard />}>
            <Route index element={<SchoolAdminDashboard />} />
            <Route path="dashboard" element={<SchoolAdminDashboard />} />
            <Route path="students" element={<SchoolAdminStudents />} />
            <Route path="students/:id" element={<SchoolAdminStudentDetail />} />
            <Route path="teachers" element={<SchoolAdminTeachers />} />
            <Route path="classes" element={<SchoolAdminClasses />} />
            <Route path="subjects" element={<SchoolAdminSubjects />} />
            <Route path="results" element={<SchoolAdminResults />} />
            <Route path="settings" element={<SchoolAdminSettings />} />
            <Route path="cycles" element={<SchoolAdminCycles />} />
            <Route path="promote" element={<SchoolAdminPromote />} />
            <Route path="analytics" element={<SchoolAdminAnalytics />} />
          </Route>

          <Route path="/:slug/teacher" element={<TeacherAuthGuard />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="results" element={<TeacherResults />} />
          </Route>

          <Route path="/:slug/student">
            <Route path="login" element={<StudentLogin />} />
            <Route path="cycles" element={<StudentCycles />} />
            <Route path="results" element={<StudentResultView />} />
          </Route>

          <Route path="/:slug/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />


        </Routes>
      </main>

    </ThemeProvider>
  )
}

export default App
