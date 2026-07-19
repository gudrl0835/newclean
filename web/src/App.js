import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';

import Home from './pages/Home';
import SearchResult from './pages/SearchResult';
import CompanyProfile from './pages/CompanyProfile';
import RequestForm from './pages/RequestForm';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';
import ReviewForm from './pages/ReviewForm';
import NotFound from './pages/NotFound';

import Login from './pages/auth/Login';
import CustomerSignup from './pages/auth/CustomerSignup';
import CompanySignup from './pages/auth/CompanySignup';

import Dashboard from './pages/company/Dashboard';
import QuotationForm from './pages/company/QuotationForm';
import MyRequests from './pages/customer/MyRequests';

import ChatbotWidget from './components/common/ChatbotWidget';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminUsers from './pages/admin/AdminUsers';

const NO_FOOTER_PATHS = ['/chat', '/admin'];

function Layout() {
  const location = useLocation();
  const hideFooter = NO_FOOTER_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* 누구나 접근 가능 */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/company/:id" element={<CompanyProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/customer" element={<CustomerSignup />} />
          <Route path="/signup/company" element={<CompanySignup />} />

          {/* 고객 전용 */}
          <Route path="/request/:companyId" element={
            <PrivateRoute role="customer"><RequestForm /></PrivateRoute>
          } />
          <Route path="/my-requests" element={
            <PrivateRoute role="customer"><MyRequests /></PrivateRoute>
          } />
          <Route path="/review/:requestId" element={
            <PrivateRoute role="customer"><ReviewForm /></PrivateRoute>
          } />

          {/* 업체 전용 */}
          <Route path="/dashboard" element={
            <PrivateRoute role="company"><Dashboard /></PrivateRoute>
          } />
          <Route path="/quotation/:requestId" element={
            <PrivateRoute role="company"><QuotationForm /></PrivateRoute>
          } />

          {/* 공통 로그인 필요 */}
          <Route path="/chats" element={
            <PrivateRoute><ChatList /></PrivateRoute>
          } />
          <Route path="/chat/:roomId" element={
            <PrivateRoute><ChatRoom /></PrivateRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      <ChatbotWidget />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 관리자 페이지 - 별도 레이아웃 */}
        <Route path="/admin" element={
          <PrivateRoute role="admin"><AdminLayout /></PrivateRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* 일반 사용자 페이지 */}
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
