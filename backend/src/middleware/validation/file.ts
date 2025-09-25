const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: any) {
  const errors: string[] = [];

  if (!file) {
    errors.push("File is required.");
    return { valid: false, errors };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    errors.push("Invalid file type. Only JPEG and PNG are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push("File size must be less than 5MB.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
export { validateFile };