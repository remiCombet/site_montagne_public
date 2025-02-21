import { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/admin/sidebar";
import Stays from "../components/admin/stays";
import Reservations from "../components/admin/reservations";
import { Link } from "react-router-dom";

import StayTest from "../components/autre/stayTest";

const AdminDashboard = () => {
    const [currentSection, setCurrentSection] = useState('reservations');
    const [selectedStay, setSelectedStay] = useState(null);
    
    // vu qu'il n'y a pas d'id dans l'url et pas apres comment on peut récupérer cet id comme ceci : 
    const { id } = useParams();
    //  ??? 

    const renderContent = () => {
        switch (currentSection) {
            case 'reservations':
                return <Reservations />;
            case 'stays':
                return (
                    // <Stays
                    //     // stayId={id}
                    //     // onStaySelect={setSelectedStay}
                    // />

                    <StayTest
                        stayId={id}
                        onStaySelect={setSelectedStay}
                    />
                );
            default:
                return <div>Section inconnue</div>;
        }
    };

    return (
        <div>
            <div className="admin-dashboard">
                <Sidebar onSectionChange={setCurrentSection} />
                <main className="main-content">
                    {renderContent()}
                    {selectedStay && (
                        <StayDetailsAdmin stay={selectedStay} />
                    )}
                </main>
            </div>
            <div>
                <br />
                <Link to="/">Accueil</Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
