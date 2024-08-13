const sanitizeSearchTerm = (searchTerm) => {
  // Create a regular expression for allowed characters (alphanumeric, spaces, and common punctuation)
  const allowedChars =
    /[^a-zA-Z0-9\s\-\.,!@#\$%\^&\*\(\)_\+=:;'"\/\\\?\[\]{}<>~`|]/g;

  // Replace any character that doesn't match the allowed characters with an empty string
  return searchTerm.replace(allowedChars, "");
};

module.exports = { sanitizeSearchTerm };
