-- Seed Initial Assessment: Java Programming Assessment

INSERT INTO tests (id, title, description, duration_minutes, is_active, total_marks)
VALUES (
    1,
    'Java Programming Assessment',
    'Part A: 8 MCQs (1 mark each)\nPart B: 2 Coding Questions (1 mark each)\nTotal: 10 marks',
    45,
    TRUE,
    10
) ON DUPLICATE KEY UPDATE title = VALUES(title);

-- =========================================================================
-- PART A: MCQs (Questions 1 to 8)
-- =========================================================================

-- Question 1
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    1, 1, 'MCQ', 1, 1,
    'Primitive Data Types',
    'Which of the following is NOT a primitive data type in Java?'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO mcq_options (id, question_id, option_key, option_text, is_correct) VALUES
(1, 1, 'A', 'int', FALSE),
(2, 1, 'B', 'boolean', FALSE),
(3, 1, 'C', 'String', TRUE),
(4, 1, 'D', 'double', FALSE)
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text);

-- Question 2
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    2, 1, 'MCQ', 2, 1,
    'If-Else Execution',
    'In an if-else statement, the else block executes when the if condition is:'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO mcq_options (id, question_id, option_key, option_text, is_correct) VALUES
(5, 2, 'A', 'true', FALSE),
(6, 2, 'B', 'false', TRUE),
(7, 2, 'C', 'true and false at the same time', FALSE),
(8, 2, 'D', 'none of these', FALSE)
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text);

-- Question 3
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    3, 1, 'MCQ', 3, 1,
    'Java OOP Purity',
    'Is Java a 100% object-oriented programming language?'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO mcq_options (id, question_id, option_key, option_text, is_correct) VALUES
(9, 3, 'A', 'Yes, because everything in Java is an object', FALSE),
(10, 3, 'B', 'No, because Java has primitive data types like int and double', TRUE),
(11, 3, 'C', 'Yes, because every program needs a class', FALSE),
(12, 3, 'D', 'No, because Java does not support classes', FALSE)
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text);

-- Question 4
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    4, 1, 'MCQ', 4, 1,
    'Java Constructors',
    'A constructor in Java must have:'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO mcq_options (id, question_id, option_key, option_text, is_correct) VALUES
(13, 4, 'A', 'A return type', FALSE),
(14, 4, 'B', 'The same name as the class', TRUE),
(15, 4, 'C', 'The static keyword', FALSE),
(16, 4, 'D', 'The void keyword', FALSE)
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text);

-- Question 5
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    5, 1, 'MCQ', 5, 1,
    'The this Keyword',
    'What does the this keyword refer to?'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO mcq_options (id, question_id, option_key, option_text, is_correct) VALUES
(17, 5, 'A', 'The current object', TRUE),
(18, 5, 'B', 'The parent class', FALSE),
(19, 5, 'C', 'A static method', FALSE),
(20, 5, 'D', 'The child class', FALSE)
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text);

-- Question 6
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    6, 1, 'MCQ', 6, 1,
    'Method Overriding',
    'What is method overriding?'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO mcq_options (id, question_id, option_key, option_text, is_correct) VALUES
(21, 6, 'A', 'Same method name with different parameters in the same class', FALSE),
(22, 6, 'B', 'Child class provides its own version of a parent class method', TRUE),
(23, 6, 'C', 'A method calling itself', FALSE),
(24, 6, 'D', 'A method with no body', FALSE)
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text);

-- Question 7
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    7, 1, 'MCQ', 7, 1,
    'Array Sizing',
    'Can the size of a Java array be changed after it is created?'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO mcq_options (id, question_id, option_key, option_text, is_correct) VALUES
(25, 7, 'A', 'Yes, it grows automatically when needed', FALSE),
(26, 7, 'B', 'Yes, by calling the expand() method', FALSE),
(27, 7, 'C', 'No, the size is fixed once the array is created', TRUE),
(28, 7, 'D', 'Yes, by writing a.length = a.length + 1', FALSE)
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text);

-- Question 8
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    8, 1, 'MCQ', 8, 1,
    'Array Length Property',
    'For:\n\nint[] a = new int[5];\n\nhow do you get the number of elements in the array?'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO mcq_options (id, question_id, option_key, option_text, is_correct) VALUES
(29, 8, 'A', 'a.length', TRUE),
(30, 8, 'B', 'a.length()', FALSE),
(31, 8, 'C', 'a.size()', FALSE),
(32, 8, 'D', 'length(a)', FALSE)
ON DUPLICATE KEY UPDATE option_text = VALUES(option_text);

-- =========================================================================
-- PART B: Coding Questions (Questions 9 and 10)
-- =========================================================================

-- Question 9: Even or Odd
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    9, 1, 'CODING', 9, 1,
    'Even or Odd',
    'Write a Java program that reads an integer using Scanner and prints whether it is Even or Odd.'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO coding_questions (id, question_id, input_format, output_format, constraints, sample_input, sample_output, language, default_template)
VALUES (
    1, 9,
    'A single integer n',
    'Print "Even" or "Odd" (without quotes)',
    '-10^9 <= n <= 10^9',
    '10',
    'Even',
    'java',
    'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n        // Write your code here\n        \n    }\n}'
) ON DUPLICATE KEY UPDATE sample_output = VALUES(sample_output);

-- Hidden and Sample Test Cases for Question 9
INSERT INTO test_cases (id, coding_question_id, input_data, expected_output, is_hidden, test_case_order) VALUES
(1, 1, '10', 'Even', FALSE, 1),
(2, 1, '10', 'Even', TRUE, 2),
(3, 1, '7', 'Odd', TRUE, 3),
(4, 1, '0', 'Even', TRUE, 4),
(5, 1, '-5', 'Odd', TRUE, 5),
(6, 1, '24', 'Even', TRUE, 6)
ON DUPLICATE KEY UPDATE expected_output = VALUES(expected_output);

-- Question 10: Search an Element in an Array
INSERT INTO questions (id, test_id, question_type, question_order, marks, title, problem_statement)
VALUES (
    10, 1, 'CODING', 10, 1,
    'Search an Element in an Array',
    'Write a Java program that reads n, then n integers into an array, then reads a target number.\n\nPrint the index/position where the target is found.\n\nIf it is not found, print -1.'
) ON DUPLICATE KEY UPDATE problem_statement = VALUES(problem_statement), title = VALUES(title);

INSERT INTO coding_questions (id, question_id, input_format, output_format, constraints, sample_input, sample_output, language, default_template)
VALUES (
    2, 10,
    'First line contains n (number of elements)\nSecond line contains n space-separated integers\nThird line contains the target integer',
    'Print the 0-based index of the target element, or -1 if not present in the array.',
    '1 <= n <= 1000\nArray elements are 32-bit signed integers',
    '5\n10 20 30 40 50\n30',
    '2',
    'java',
    'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n        // Write your code here\n        \n    }\n}'
) ON DUPLICATE KEY UPDATE output_format = VALUES(output_format), sample_output = VALUES(sample_output);

-- Hidden and Sample Test Cases for Question 10
INSERT INTO test_cases (id, coding_question_id, input_data, expected_output, is_hidden, test_case_order) VALUES
(7, 2, '5\n10 20 30 40 50\n30', '2', FALSE, 1),
(8, 2, '5\n10 20 30 40 50\n30', '2', TRUE, 2),
(9, 2, '5\n10 20 30 40 50\n100', '-1', TRUE, 3),
(10, 2, '4\n5 8 12 20\n5', '0', TRUE, 4),
(11, 2, '6\n1 2 3 4 5 6\n6', '5', TRUE, 5)
ON DUPLICATE KEY UPDATE expected_output = VALUES(expected_output);
