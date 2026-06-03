export function createSlug(name: string) {
    return name.toLowerCase().trim().replace(/\s+/g, '-')
}