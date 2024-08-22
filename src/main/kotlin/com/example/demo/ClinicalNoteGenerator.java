package com.example.demo;

import okhttp3.*;
import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

import java.io.IOException;

public class ClinicalNoteGenerator {

    private static final String API_KEY = "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";
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    public static void main(String[] args) {
        String transcription = "Patient reports severe headaches for the last two weeks, currently taking ibuprofen daily.";

        try {
            String summary = generateClinicalNoteFromTranscription(transcription);
            System.out.println("Generated Clinical Note:\n" + summary);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static String generateClinicalNoteFromTranscription(String transcription) throws IOException {
        OkHttpClient client = new OkHttpClient();

        // Create JSON body
        String json = new Gson().toJson(new ChatRequest(transcription));

        // Build request
        RequestBody body = RequestBody.create(json, MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(API_URL)
                .post(body)
                .addHeader("Authorization", "Bearer " + API_KEY)
                .build();

        // Execute request
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }

            String responseBody = response.body().string();
            ChatResponse chatResponse = new Gson().fromJson(responseBody, ChatResponse.class);

            // Assuming response contains a list of choices
            if (chatResponse.choices != null && chatResponse.choices.length > 0) {
                return chatResponse.choices[0].message.content;
            } else {
                return "No content found in the response.";
            }
        }
    }

    // Inner classes to represent the request and response structure
    static class ChatRequest {
        String model = "gpt-4";
        ChatMessage[] messages;

        ChatRequest(String transcription) {
            this.messages = new ChatMessage[]{new ChatMessage("user", transcription)};
        }
    }

    static class ChatMessage {
        String role;
        String content;

        ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }

    static class ChatResponse {
        Choice[] choices;

        static class Choice {
            Message message;

            static class Message {
                @SerializedName("content")
                String content;
            }
        }
    }
}
