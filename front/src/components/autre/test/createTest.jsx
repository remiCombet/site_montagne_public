import { useState } from 'react';
import { useSelector } from 'react-redux';
import { createArticle } from '../../../api/admin/article';
import { useNavigate } from 'react-router-dom';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const CreateTest = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        content: '',
        location: '',
        startDate: '',
        endDate: ''
    });
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const user = useSelector(state => state.user.infos);

    // Gestion des champs texte et dates
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'startDate' || name === 'endDate') {
            // Pour les dates, on vérifie si la valeur est valide
            const date = parseISO(value);
            if (isValid(date)) {
                // Format la date en YYYY-MM-DD
                const formattedDate = format(date, 'yyyy-MM-dd');
                setFormData(prev => ({
                    ...prev,
                    [name]: formattedDate
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Gestion des images
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
    };

    // Validation des dates
    const validateDates = () => {
        const startDate = parseISO(formData.startDate);
        const endDate = parseISO(formData.endDate);
        const today = new Date();

        if (!isValid(startDate) || !isValid(endDate)) {
            setError('Les dates ne sont pas valides');
            return false;
        }

        if (startDate < today) {
            setError('La date de début ne peut pas être dans le passé');
            return false;
        }

        if (endDate < startDate) {
            setError('La date de fin doit être après la date de début');
            return false;
        }

        return true;
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation des dates avant envoi
        if (!validateDates()) {
            setLoading(false);
            return;
        }

        try {
            const articleData = {
                ...formData,
                images: images,
                userId: user.id
            };

            const response = await createArticle(articleData);
            
            if (response.status === 201) {
                navigate('/admin/articles');
            } else {
                setError(response.message || 'Erreur lors de la création');
            }
        } catch (err) {
            setError('Erreur lors de la création de l\'article');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Créer un nouvel article</h2>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">Titre :</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">Description courte :</label>
                    <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">Contenu :</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full p-2 border rounded min-h-[200px]"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">Lieu :</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Date de début :</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                            // Ajouter le pattern pour forcer le format YYYY-MM-DD
                            pattern="\d{4}-\d{2}-\d{2}"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Date de fin :</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                            // Ajouter le pattern pour forcer le format YYYY-MM-DD
                            pattern="\d{4}-\d{2}-\d{2}"
                        />
                    </div>
                </div>

                <div>
                    <label className="block mb-2">Images :</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-2 text-white rounded ${
                        loading 
                            ? 'bg-gray-400' 
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {loading ? 'Création en cours...' : 'Créer l\'article'}
                </button>
            </form>
        </div>
    );
};

export default CreateTest;