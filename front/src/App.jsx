import { AuthProvider } from "./context/authContext";

import Home from "./containers/home";
import Layout from "./components/layout";
import Profil from "./containers/user/profil";
import Stay from "./components/stayList";
import StayDetails from "./containers/stay/stayDetails";

import AdminDashboard from "./containers/adminDashboard";

import AuthTest from "./containers/user/auth";

import RequireAuth from "./utils/requireAuth";

import './sass/main.scss';
// import './sass/test/mainTest.scss';

import { Routes, Route } from "react-router-dom";
import Test from './components/autre/test/test';  // Assurez-vous que le chemin d'importation est correct

function App() {

  return (
    <AuthProvider>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<RequireAuth child={Home} auth={false} admin={false}/>}/>
            <Route path="/profil" element={<RequireAuth child={Profil} auth={true} admin={false}/>}/>
            <Route path="/stays" element={<RequireAuth child={Stay} auth={false} admin={false}/>}/>
            <Route path="/stays/:id" element={<RequireAuth child={StayDetails} auth={false} admin={false}/>}/>
            <Route path="/admin-dashboard" element={<RequireAuth child={AdminDashboard} auth={true} admin={true}/>}/>
            <Route path="/auth" element={<AuthTest />}/>
            <Route path="/test" element={<Test />} />
            <Route path="*" element={<div>Page non trouvée</div>} />
          </Routes>
        </Layout>
      </div>
    </AuthProvider>
  )
}

export default App;