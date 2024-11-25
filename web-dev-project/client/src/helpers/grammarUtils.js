import axios from "axios";

export const checkGrammar = async (text) => {
  if (!text) {
    throw new Error("No text provided for grammar checking.");
  }

  try {
    // API from language tool
    const response = await axios.post(
      "https://api.languagetool.org/v2/check",
      null,
      {
        params: {
          text: text,
          language: "en-US",
        },
      }
    );

    let correctedText = text;
    response.data.matches
      .slice()
      .reverse()
      .forEach((match) => {
        const { offset, length, replacements } = match;
        if (replacements.length > 0) {
          correctedText =
            correctedText.slice(0, offset) +
            replacements[0].value +
            correctedText.slice(offset + length);
        }
      });

    return correctedText;
  } catch (error) {
    console.error("Error checking grammar:", error);
    throw new Error("Failed to check grammar.");
  }
};
