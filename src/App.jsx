// App.jsx
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './pages/Auth/ForgotPassword'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ResetPassword from './pages/Auth/ResetPassword'
import VerifyEmail from './pages/Auth/VerifyEmail'
import Dashboard from './pages/Dashboard/Dashboard'
import Feedback from './pages/Dashboard/Feedback'
import History from './pages/Dashboard/History'
import HistoryDetail from './pages/Dashboard/HistoryDetail'
import Statistics from './pages/Dashboard/Statistics'
import UploadImage from './pages/Detection/UploadImage'
import ModelManagement from './pages/ModelManagement/ModelManagement'
import NotFound from './pages/NotFound'
import SpeciesDetail from './pages/Species/SpeciesDetail'
import SpeciesList from './pages/Species/SpeciesList'
import ChangePassword from './pages/User/ChangePassword'
import Profile from './pages/User/Profile'
// Import các trang admin mới
import DetectionHistory from './pages/DetectionHistory/DetectionHistory'
import FeedbackManagement from './pages/FeedbackManagement/FeedbackManagement'
import UserManagement from './pages/UserManagement/UserManagement'

function App() {
  return (
    <Routes>
      {/* Public routes - không có Layout */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      {/* Detection public route - chỉ cho chưa đăng nhập */}
      <Route path="/detection" element={<UploadImage />} />
      
      <Route path="/species" element={<SpeciesList />} />
      <Route path="/species/:id" element={<SpeciesDetail />} />
      
      {/* Protected routes với Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<HistoryDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          {/* Detection protected route - có layout khi đã login */}
          <Route path="/detection-protected" element={<UploadImage />} />
          
          {/* Admin only routes */}
          <Route path="/model-management" element={<ModelManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/detection-history" element={<DetectionHistory />} />
          <Route path="/feedback-management" element={<FeedbackManagement />} />
        </Route>
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App