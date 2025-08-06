import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  highlights: [], 
};

const highlightsSlice = createSlice({
  name: 'highlights',
  initialState,
  reducers: {
    // Action pour ajouter un point positif
    addHighlight: (state, action) => {
      state.highlights.push(action.payload);
    },
    // Action pour mettre à jour un point positif existant
    updateHighlight: (state, action) => {
      const index = state.highlights.findIndex(highlight => highlight.id === action.payload.id);
      if (index !== -1) {
        state.highlights[index] = action.payload;
      }
    },
    // Action pour supprimer un point positif
    deleteHighlight: (state, action) => {
      state.highlights = state.highlights.filter(highlight => highlight.id !== action.payload.id);  
    },
    // Action pour charger tous les points positifs d'un séjour
    setHighlights: (state, action) => {
      state.highlights = action.payload;
    },
  },
});

// Exports des actions générées automatiquement par createSlice
export const { addHighlight, updateHighlight, deleteHighlight, setHighlights } = highlightsSlice.actions;
export const selectHighlights = (state) => state.highlights;

// Export du reducer à inclure dans le store Redux
export default highlightsSlice.reducer;