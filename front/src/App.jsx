import Header from "./components/header";
import Home from "./containers/home";
import Register from "./containers/user/register";
import Login from "./containers/user/login";
import Profil from "./containers/user/profil";
import Stay from "./components/stayList";
import StayDetails from "./containers/stay/stayDetails";
import Highlights from "./components/testHighlights";

import Test from "./components/test";

import RequireAuth from "./utils/requireAuth";

import { Routes, Route } from "react-router-dom";

function App() {

  return (
    <div className="App">
      {/* <Header /> */}
      <section className="background-section">

      </section>
      <main className="main-content">
        <Routes>
          {/* <Route path="/" element={<RequireAuth child={Home} auth={false} admin={false}/>}/> */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/profil" element={<RequireAuth child={Profil} auth={true} admin={false}/>}/>
          <Route path="/stays" element={<RequireAuth child={Stay} auth={true} admin={false}/>}/>
          <Route path="/stays/:id" element={<RequireAuth child={StayDetails} auth={true} admin={false}/>}/>
          <Route path="/highlights" element={<Highlights />}/>

          <Route path="/test" element={<Test />}/>

          <Route path="*" element={<div>Page non trouvée</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App