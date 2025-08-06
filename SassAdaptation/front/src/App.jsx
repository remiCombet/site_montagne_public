import { AuthProvider } from "./context/authContext";

import Home from "./containers/home";
import Layout from "./components/layout";
import Profil from "./containers/user/profil";
import Stay from "./components/stayList";
// import StayDetails from "./components/affichage/StayDetails";
import Test2 from "./components/affichage/Test";
import Contact from "./components/affichage/Contact";

import AdminDashboard from "./containers/adminDashboard";

import AuthTest from "./containers/user/auth";

import RequireAuth from "./utils/requireAuth";

import './sass/main.scss';

import { Routes, Route } from "react-router-dom";
import Test from './components/autre/test/test';

function App() {

  return (
    <AuthProvider>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<RequireAuth child={Home} auth={false} admin={false} pageName="home"/>}/>
            <Route path="/profil" element={<RequireAuth child={Profil} auth={true} admin={false} pageName="profile"/>}/>
            <Route path="/stays" element={<RequireAuth child={Stay} auth={false} admin={false} pageName="stays"/>}/>
            <Route path="/stays/:id" element={<RequireAuth child={Test2} auth={false} admin={false} pageName="stay-details"/>}/>
            {/* <Route path="/stays/:id" element={<RequireAuth child={StayDetails} auth={false} admin={false} pageName="stay-details"/>}/> */}
            <Route path="/contact" element={<RequireAuth child={Contact} auth={false} admin={false} pageName="contact"/>}/>
            <Route path="/admin-dashboard" element={<RequireAuth child={AdminDashboard} auth={true} admin={true} pageName="admin"/>}/>
            <Route path="/auth" element={<AuthTest pageName="auth" />}/>
            <Route path="/test" element={<Test pageName="test" />} />
            <Route path="*" element={<div>Page non trouvée</div>} />
          </Routes>
        </Layout>
      </div>
    </AuthProvider>
  )
}

export default App;