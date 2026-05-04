export const isStrongPassword = (value: string) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);

