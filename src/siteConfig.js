// Set VITE_CONTACT_EMAIL in the environment to open a prepared enquiry addressed to the studio.
// Until the real contact is supplied, the form creates a copyable local enquiry draft.
export const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL || '').trim();
