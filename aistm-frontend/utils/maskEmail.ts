export function maskEmail(email?: string | null): string {
    if (!email) {
        return "";
    }

    const normalized = email.trim();
    if (!normalized) {
        return "";
    }

    const atIndex = normalized.indexOf("@");
    if (atIndex === -1) {
        return "※※※";
    }

    const domain = normalized.slice(atIndex + 1);
    return domain ? `※※※@${domain}` : "※※※";
}
