export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for insecure contexts (e.g. HTTP on local network)
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};
