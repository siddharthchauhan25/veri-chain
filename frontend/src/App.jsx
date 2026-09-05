import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Profile from "./pages/profile";
import DocumentDetails from "./pages/DocumentDetails";
import Admin from "./pages/Admin";

import Dashboard from "./pages/Dashboard";
import Identity from "./pages/Identity";
import Documents from "./pages/Documents";
import Verify from "./pages/Verify";
import Blockchain from "./pages/Blockchain";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import QRVerify from "./pages/QRVerify";

import Login from "./pages/login";
import Register from "./pages/register";

import "./App.css";


function ProtectedLayout({ children }) {

  const user = localStorage.getItem("verichain_user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <div className="page-content">
          {children}
        </div>

      </main>

    </div>
  );
}


function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* Authentication */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Protected Application */}

        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/identity"
          element={
            <ProtectedLayout>
              <Identity />
            </ProtectedLayout>
          }
        />
        <Route
  path="/profile"
  element={
    <ProtectedLayout>
      <Profile />
    </ProtectedLayout>
  }
/>

        <Route
          path="/documents"
          element={
            <ProtectedLayout>
              <Documents />
            </ProtectedLayout>
          }
        />
              <Route
  path="/documents/:id"
  element={
    <ProtectedLayout>
      <DocumentDetails />
    </ProtectedLayout>
  }
/>

        <Route
          path="/verify"
          element={
            <ProtectedLayout>
              <Verify />
            </ProtectedLayout>
          }
        />
        <Route
           path="/qr-verify"
           element={
            <ProtectedLayout>
              <QRVerify />
            </ProtectedLayout>
          }
        />

        <Route
          path="/blockchain"
          element={
            <ProtectedLayout>
              <Blockchain />
            </ProtectedLayout>
          }
        />

        <Route
          path="/activity"
          element={
            <ProtectedLayout>
              <Activity />
            </ProtectedLayout>
          }
        />
        <Route
         path="/notifications"
        element={
            <ProtectedLayout>
              <Notifications />
            </ProtectedLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          }
        />
              <Route
            path="/admin"
           element={
              <ProtectedLayout>
                 <Admin />
                </ProtectedLayout>
                }
                />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;