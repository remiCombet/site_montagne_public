import { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/admin/sidebar";
import Reservations from "../components/admin/reservations";
import Article from "../components/autre/articles/article";
import StayTest from "../components/autre/stayTest";

const AdminDashboard = () => {
    const [currentSection, setCurrentSection] = useState('reservations');
    const [selectedStay, setSelectedStay] = useState(null); 
    const { id } = useParams();

    const renderContent = () => {
        switch (currentSection) {
            case 'reservations':
                return <Reservations />;
            case 'stays':
                return (
                    <StayTest
                        stayId={id}
                        onStaySelect={setSelectedStay}
                    />
                );
            case 'articles':
                return <Article />;
            default:
                return <div>Section inconnue</div>;
        }
    };

    return (
        <div className="admin-dashboard">
            <Sidebar
                onSectionChange={setCurrentSection}
                currentSection={currentSection}
            />
            <main className="admin-content">
                {renderContent()}
                {selectedStay && <StayDetailsAdmin stay={selectedStay} />}
            </main>
        </div>
    );
};

export default AdminDashboard;
