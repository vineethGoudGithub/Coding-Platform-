package com.assessment.quiz.service.judge0;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class Judge0Response {

    private String token;

    private String stdout;

    private String stderr;

    @JsonProperty("compile_output")
    private String compileOutput;

    private String message;

    private String time; // e.g. "0.052"

    private Integer memory; // in KB

    private Status status;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Status {
        private Integer id;
        private String description;
    }

    public boolean isAccepted() {
        return status != null && status.getId() != null && status.getId() == 3;
    }

    public String getStatusDescription() {
        return status != null && status.getDescription() != null ? status.getDescription() : "Unknown";
    }

    public Double getTimeInSeconds() {
        if (time == null || time.isBlank()) {
            return 0.0;
        }
        try {
            return Double.parseDouble(time);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
