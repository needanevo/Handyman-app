/**
 * The Real Johnson - Hire Flow JavaScript
 * Handles localStorage persistence for multi-step form
 */

const DRAFT_KEY = 'hireJobDraft';

/**
 * Load existing draft from localStorage
 * @returns {Object} Draft object with all form data
 */
function loadDraft() {
    try {
        const stored = localStorage.getItem(DRAFT_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading draft:', e);
    }
    return {};
}

/**
 * Save partial data to draft (merges with existing)
 * @param {Object} partialData - Data to merge into existing draft
 */
function saveDraft(partialData) {
    try {
        const existing = loadDraft();
        const updated = { ...existing, ...partialData };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('Error saving draft:', e);
        return {};
    }
}

/**
 * Clear the entire draft
 */
function clearDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
        console.error('Error clearing draft:', e);
    }
}

/**
 * Get draft as formatted summary
 * @returns {Object} Formatted summary object
 */
function getDraftSummary() {
    const draft = loadDraft();

    return {
        location: draft.address && draft.city && draft.state && draft.zip
            ? `${draft.address}, ${draft.city}, ${draft.state} ${draft.zip}`
            : 'Not provided',
        category: draft.category || 'Not selected',
        title: draft.title || 'Not provided',
        description: draft.description || 'Not provided',
        budget: draft.budgetMax
            ? `$${draft.budgetMax} max`
            : 'Not specified',
        urgency: draft.urgency || 'Not specified',
        timing: draft.timing || 'Not specified',
        photos: [draft.photo1, draft.photo2, draft.photo3].filter(p => p).length,
        notes: draft.notes || 'None',
        contractorPreference: draft.contractorPreference || 'no_preference'
    };
}

// Make functions globally available
window.loadDraft = loadDraft;
window.saveDraft = saveDraft;
window.clearDraft = clearDraft;
window.getDraftSummary = getDraftSummary;
