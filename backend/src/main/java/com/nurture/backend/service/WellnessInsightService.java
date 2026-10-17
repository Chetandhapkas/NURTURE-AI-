
package com.nurture.backend.service;

import com.nurture.backend.ai.AiService;
import com.nurture.backend.dto.ReportResponse;
import com.nurture.backend.entity.PregnancyProfile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class WellnessInsightService {

    private static final Logger log =
            LoggerFactory.getLogger(WellnessInsightService.class);

    private final AiService aiService;

    public WellnessInsightService(AiService aiService) {
        this.aiService = aiService;
    }

    public ReportResponse.AiInsight generateInsight(
            Long userId,
            PregnancyProfile pregnancy,
            ReportResponse.Health health,
            ReportResponse.Nutrition nutrition,
            ReportResponse.Mood mood,
            ReportResponse.Symptoms symptoms,
            Double overallScore,
            LocalDate startDate,
            LocalDate endDate) {

        ReportResponse.AiInsight insight =
                new ReportResponse.AiInsight();

        String prompt = buildPrompt(
                pregnancy,
                health,
                nutrition,
                mood,
                symptoms,
                overallScore,
                startDate,
                endDate
        );

        try {
            String aiResponse = aiService.askAi(userId, prompt);

            if (aiResponse == null || aiResponse.isBlank()) {
                return unavailableInsight();
            }

            String message = extract(aiResponse, "MESSAGE");
            String summary = extract(aiResponse, "SUMMARY");
            String recommendation = extract(aiResponse, "RECOMMENDATION");

            // Use the AI response even if it does not follow the exact format.
            if (message == null || summary == null || recommendation == null) {
                insight.setMessage(aiResponse.trim());
                insight.setSummary(
                        "AI analysis was generated from the available weekly wellness data."
                );
                insight.setRecommendation(
                        "Use this as general wellness guidance, not as a medical diagnosis."
                );
                return insight;
            }

            insight.setMessage(message);
            insight.setSummary(summary);
            insight.setRecommendation(recommendation);

            return insight;

        } catch (Exception e) {
            log.warn(
                    "Unable to generate AI wellness insight for user {}: {}",
                    userId,
                    e.getMessage()
            );

            return unavailableInsight();
        }
    }

    private String buildPrompt(
            PregnancyProfile pregnancy,
            ReportResponse.Health health,
            ReportResponse.Nutrition nutrition,
            ReportResponse.Mood mood,
            ReportResponse.Symptoms symptoms,
            Double overallScore,
            LocalDate startDate,
            LocalDate endDate) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                Generate a personalized weekly wellness insight for NURTURE AI,
                a pregnancy wellness and family support application.

                Analyze only the information supplied below.
                Do not invent measurements, trends, symptoms, or medical history.
                Missing values are marked "Not recorded"; do not interpret them as zero.
                This data is for general wellness tracking and is not a clinical diagnosis.

                Pregnancy safety requirements:
                - Do not diagnose a medical condition.
                - Do not prescribe medicines or change treatment.
                - Do not claim that a pregnancy or baby is medically healthy based on scores.
                - Give practical, gentle, pregnancy-aware general wellness guidance.
                - If the supplied symptom data indicates higher severity, recommend
                  contacting a qualified healthcare professional.
                - Do not create unnecessary alarm when the data does not support it.
                - If there is insufficient data, say so honestly.

                Weekly report data:
                """);

        prompt.append("\nReport period: ")
                .append(startDate)
                .append(" to ")
                .append(endDate);

        prompt.append("\nPregnancy week: ")
                .append(pregnancy == null
                        ? "Not recorded"
                        : format(pregnancy.getPregnancyWeek()));

        prompt.append("\nTrimester: ")
                .append(pregnancy == null
                        ? "Not recorded"
                        : format(pregnancy.getTrimester()));

        prompt.append("\nBaby count: ")
                .append(pregnancy == null
                        ? "Not recorded"
                        : format(pregnancy.getBabyCount()));

        prompt.append("\nDue date: ")
                .append(pregnancy == null
                        ? "Not recorded"
                        : format(pregnancy.getDueDate()));

        prompt.append("\nAverage daily steps: ")
                .append(format(health.getAverageSteps()));

        prompt.append("\nAverage daily activity minutes: ")
                .append(format(health.getAverageActivityMinutes()));

        prompt.append("\nAverage daily distance in km: ")
                .append(format(health.getAverageDistanceKm()));

        prompt.append("\nAverage health score: ")
                .append(format(health.getAverageHealthScore()));

        prompt.append("\nNutrition score: ")
                .append(format(nutrition.getScore()));

        prompt.append("\nNutrition status: ")
                .append(format(nutrition.getStatus()));

        prompt.append("\nMood score: ")
                .append(format(mood.getScore()));

        prompt.append("\nMood status: ")
                .append(format(mood.getStatus()));

        prompt.append("\nAverage symptom severity: ")
                .append(format(symptoms.getAverageSeverity()));

        prompt.append("\nDays with recorded symptoms: ")
                .append(format(symptoms.getDaysWithSymptoms()));

        prompt.append("\nSymptom status: ")
                .append(format(symptoms.getStatus()));

        prompt.append("\nSymptom trend: ")
                .append(format(symptoms.getTrend()));

        prompt.append("\nOverall wellness score: ")
                .append(format(overallScore));

        prompt.append("""

                Write the result in simple, supportive English.
                Personalize it using the actual supplied data.
                Do not merely repeat all the numbers.

                Return exactly three lines, with no markdown and no extra text:
                MESSAGE: One concise personalized weekly insight.
                SUMMARY: Two or three sentences explaining the main observations
                and any limitations caused by missing data.
                RECOMMENDATION: One or two practical, safe next steps.

                Each label must appear exactly once.
                Keep each field on a single line.
                """);

        return prompt.toString();
    }

    private String extract(String response, String label) {
        String prefix = label + ":";

        for (String line : response.split("\\R")) {
            String trimmed = line.trim();

            if (trimmed.regionMatches(
                    true, 0, prefix, 0, prefix.length())) {

                String value = trimmed.substring(prefix.length()).trim();

                if (!value.isBlank()) {
                    return value;
                }
            }
        }

        return null;
    }

    private String format(Object value) {
        return value == null ? "Not recorded" : value.toString();
    }

    private ReportResponse.AiInsight unavailableInsight() {
        ReportResponse.AiInsight insight =
                new ReportResponse.AiInsight();

        insight.setMessage(
                "Your weekly AI wellness insight is temporarily unavailable."
        );

        insight.setSummary(
                "Your report is available, but the AI service could not generate "
                        + "a personalized analysis right now."
        );

        insight.setRecommendation(
                "Try refreshing the report later. For medical concerns, contact "
                        + "your healthcare professional."
        );

        return insight;
    }
}
