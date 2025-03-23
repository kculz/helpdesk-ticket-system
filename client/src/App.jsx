import { Route, Routes } from "react-router-dom"
import { SendOtp, VerifyOtp } from "./pages"
import { AdminDashboard, AdminProfile, AdminTicketList } from "./users/admin"
import { KnowledgeBase, Profile, TicketChat, TicketsList, UserDashboard, ViewTicket } from "./users/user"
import { AdminDashboardLayout, ProtectedRoutes, UserDashboardLayout } from "./layouts"

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<SendOtp />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          <Route element={<ProtectedRoutes />} >

            <Route path="/user" element={<UserDashboardLayout />} >
              <Route index element={<UserDashboard />} />
              <Route path="chat" element={<TicketChat />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="tickets-list" element={<TicketsList />} />
              <Route path="profile" element={<Profile />} />
              <Route path="ticket/:id" element={<ViewTicket />} />
            </Route>

            <Route path="/admin" element={<AdminDashboardLayout />} >
              <Route index element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path='tickets-list' element={<AdminTicketList />} />
            </Route>

          </Route>
        </Routes>

    </>
  )
}

export default App