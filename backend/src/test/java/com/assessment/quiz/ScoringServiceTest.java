package com.assessment.quiz;

import com.assessment.quiz.util.OutputNormalizer;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ScoringServiceTest {

    @Test
    void testOutputNormalization_trailingSpacesAndNewlines() {
        String actual = "Even   \r\n";
        String expected = "Even";
        assertTrue(OutputNormalizer.matches(actual, expected));

        String actualMultiLine = "2  \r\n";
        String expectedMultiLine = "2\n";
        assertTrue(OutputNormalizer.matches(actualMultiLine, expectedMultiLine));
    }

    @Test
    void testOutputNormalization_windowsAndLinuxDifferences() {
        String windowsOutput = "Line 1\r\nLine 2\r\n";
        String linuxOutput = "Line 1\nLine 2";
        assertTrue(OutputNormalizer.matches(windowsOutput, linuxOutput));
    }

    @Test
    void testOutputNormalization_mismatchedOutput() {
        String actual = "Odd";
        String expected = "Even";
        assertFalse(OutputNormalizer.matches(actual, expected));
    }

    @Test
    void testOutputNormalization_searchArrayOutput() {
        String actual = "Not found\n";
        String expected = "Not found";
        assertTrue(OutputNormalizer.matches(actual, expected));
    }
}
