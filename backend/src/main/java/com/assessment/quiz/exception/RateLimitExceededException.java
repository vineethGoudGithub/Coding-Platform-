package com.assessment.quiz.exception;

public class RateLimitExceededException extends ApiException {
    public RateLimitExceededException(String message) {
        super(message);
    }
}
