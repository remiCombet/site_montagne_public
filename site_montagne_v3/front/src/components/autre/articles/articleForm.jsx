import React, { useState } from 'react';
import './_editableComponent.scss';

const ArticleForm = ({ onClose, onSuccess, initialData }) => {
    const [title, setTitle] = useState(initialData ? initialData.title : '');
    const [content, setContent] = useState(initialData ? initialData.content : '');
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to handle form submission, including image upload
        // Call onSuccess after successful submission
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    return (
        <div className="image-edit-mode">
            <div className="section-header">
                <h3>{initialData ? 'Modifier l\'article' : 'Ajouter un article'}</h3>
                <button onClick={onClose} className="btn-close">X</button>
            </div>
            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
            <form onSubmit={handleSubmit} className="form-section">
                <div className="form-group">
                    <label>Titre</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Contenu</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="text-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Image</label>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        className="file-input"
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-submit">Enregistrer</button>
                </div>
            </form>
        </div>
    );
};

export default ArticleForm;