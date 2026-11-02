-- Migration V3: Update Question 10 output format and test case to return -1 when not found

UPDATE questions 
SET problem_statement = 'Write a Java program that reads n, then n integers into an array, then reads a target number.\n\nPrint the index/position where the target is found.\n\nIf it is not found, print -1.'
WHERE id = 10;

UPDATE coding_questions
SET output_format = 'Print the 0-based index of the target element, or -1 if not present in the array.'
WHERE question_id = 10;

UPDATE test_cases
SET expected_output = '-1'
WHERE coding_question_id = 2 AND (expected_output = 'Not found' OR id = 9);
