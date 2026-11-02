package com.assessment.quiz.util;

public final class OutputNormalizer {

    private OutputNormalizer() {
    }

    /**
     * Normalizes output string for deterministic comparison:
     * - Converts \r\n (Windows) and \r to \n (Unix)
     * - Trims trailing whitespace from each line
     * - Trims leading and trailing overall whitespace/newlines
     */
    public static String normalize(String output) {
        if (output == null) {
            return "";
        }

        // Standardize newlines
        String normalized = output.replace("\r\n", "\n").replace("\r", "\n");

        // Split into lines and trim trailing spaces on each line
        String[] lines = normalized.split("\n", -1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            // Trim right whitespace
            String line = lines[i].replaceAll("\\s+$", "");
            sb.append(line);
            if (i < lines.length - 1) {
                sb.append("\n");
            }
        }

        // Strip leading and trailing whitespace from the full output
        return sb.toString().strip();
    }

    /**
     * Checks if actual output matches expected output after normalization.
     */
    public static boolean matches(String actual, String expected) {
        return normalize(actual).equals(normalize(expected));
    }
}
