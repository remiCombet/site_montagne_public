import { createSlice } from "@reduxjs/toolkit";

// Fonction pour créer un slice générique
const createGenericSlice = (name) => {
  const initialState = {
    data: [], // Pour stocker les données de la table (ex: highlights, themes)
    selectedItem: null, // Pour stocker l'élément sélectionné
    isLoading: false, // Pour gérer l'état de chargement
    error: null, // Pour gérer les erreurs
  };

  return createSlice({
    name: name,
    initialState,
    reducers: {
      // Action pour définir les données de la table
      setData: (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
        state.error = null;
      },
      // Action pour définir l'élément sélectionné
      setSelectedItem: (state, action) => {
        state.selectedItem = action.payload;
      },
      // Action pour ajouter un nouvel élément à la table
      addItem: (state, action) => {
        state.data.push(action.payload);
      },
      // Action pour mettre à jour un élément existant
      updateItem: (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload };
          if (state.selectedItem?.id === action.payload.id) {
            state.selectedItem = { ...state.selectedItem, ...action.payload };
          }
        }
      },
      // Action pour supprimer un élément
      deleteItem: (state, action) => {
        state.data = state.data.filter(item => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      },
      // Action pour gérer le chargement
      setLoading: (state, action) => {
        state.isLoading = action.payload;
      },
      // Action pour gérer les erreurs
      setError: (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      },
    },
  });
};

// Exemple d'utilisation pour les highlights
// export const highlightsSlice = createGenericSlice("highlights");
// export const { setData, setSelectedItem, addItem, updateItem, deleteItem, setLoading, setError } = highlightsSlice.actions;
// export const selectHighlights = (state) => state.highlights;

// // Exemple d'utilisation pour les themes
// export const themesSlice = createGenericSlice("themes");
// export const { setData: setThemesData, setSelectedItem: setSelectedTheme, addItem: addTheme, updateItem: updateTheme, deleteItem: deleteTheme } = themesSlice.actions;
// export const selectThemes = (state) => state.themes;

// export default {
//   highlights: highlightsSlice.reducer,
//   themes: themesSlice.reducer,
// };