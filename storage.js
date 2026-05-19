// storage.js - localStorage persistence module for Reali Sports scores

const ScoreStorage = {
  STORAGE_KEY: 'reali_sports_history',
  
  /**
   * Save a score to history
   * @param {Object} scoreData - Score data to save
   * @param {string} scoreData.type - 'single' or 'final'
   * @param {number} scoreData.finalScore - The calculated score
   * @param {number} scoreData.timestamp - Timestamp of the score
   */
  saveScore: function(scoreData) {
    try {
      const history = this.getHistory();
      
      // Generate unique ID
      const id = Date.now() + Math.random();
      
      // Add ID to score data
      const scoreWithId = {
        ...scoreData,
        id: id
      };
      
      history.push(scoreWithId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving score:', error);
    }
  },
  
  /**
   * Get all scores from history, sorted by timestamp (newest first)
   * @returns {Array} Array of score objects
   */
  getHistory: function() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }
      
      const history = JSON.parse(data);
      
      // Sort by timestamp descending (newest first)
      return history.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error loading history:', error);
      // Return empty array if data is corrupted
      return [];
    }
  },
  
  /**
   * Delete a specific score by ID
   * @param {number} id - The ID of the score to delete
   */
  deleteScore: function(id) {
    try {
      let history = this.getHistory();
      history = history.filter(score => score.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error deleting score:', error);
    }
  },
  
  /**
   * Delete all scores from history
   */
  deleteAll: function() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  },
  
  /**
   * Get history filtered by type
   * @param {string} type - 'single' or 'final'
   * @returns {Array} Filtered array of score objects
   */
  getHistoryByType: function(type) {
    try {
      const history = this.getHistory();
      return history.filter(score => score.type === type);
    } catch (error) {
      console.error('Error filtering history:', error);
      return [];
    }
  }
};

// Export for Node.js, make available globally for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreStorage;
} else if (typeof window !== 'undefined') {
  window.ScoreStorage = ScoreStorage;
}
