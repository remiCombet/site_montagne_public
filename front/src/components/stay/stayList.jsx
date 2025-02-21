import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/userSlice';
import StayCardAdmin from './stayCardAdmin';
import StayCardUser from './stayCardUser';

const StayList = ({ stays, onStaySelect, selectedStay, onStayDeselect }) => {
    const { role } = useSelector(selectUser);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stays.map((stay) => (
                <div key={stay.id} className="relative">
                    {role === "admin" ? 
                        <StayCardAdmin 
                            stay={stay} 
                            onSelect={onStaySelect}
                            selectedStay={selectedStay}
                            onDeselect={onStayDeselect}
                        /> 
                        : 
                        <StayCardUser stay={stay} />
                    }
                </div>
            ))}
        </div>
    );
};

export default StayList;