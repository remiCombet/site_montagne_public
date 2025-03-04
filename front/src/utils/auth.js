// Function to get the authentication token - utilisée uniquement en interne
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Authentication headers - seule fonction exportée
export const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});