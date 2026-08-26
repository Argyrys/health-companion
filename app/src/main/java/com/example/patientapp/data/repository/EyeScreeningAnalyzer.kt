package com.example.patientapp.data.repository

import android.content.Context
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import com.example.patientapp.BuildConfig
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class EyeScreeningResult(
    val riskLevel: String,
    val findings: String,
    val recommendation: String
)

object EyeScreeningAnalyzer {

    private const val PROMPT = """You are an AI eye health screening assistant. Analyze this eye image and provide a structured assessment.

Respond in EXACTLY this format (no extra text):

RISK_LEVEL: [LOW/MODERATE/HIGH/CRITICAL]

FINDINGS:
- [observation 1]
- [observation 2]
- [observation 3]
- [observation 4]

RECOMMENDATION: [one paragraph recommendation]

Guidelines:
- LOW: No visible abnormalities, healthy eye appearance
- MODERATE: Minor observations (mild redness, slight irritation, age-related changes)
- HIGH: Concerning findings (clouding, unusual discoloration, signs of disease)
- CRITICAL: Urgent findings requiring immediate medical attention

Be professional and clinical. Always recommend consulting an ophthalmologist for definitive diagnosis."""

    suspend fun analyze(context: Context, imageUri: Uri): Result<EyeScreeningResult> {
        return withContext(Dispatchers.IO) {
            try {
                val apiKey = BuildConfig.GEMINI_API_KEY
                if (apiKey.isBlank()) {
                    return@withContext Result.failure(Exception("Gemini API key not configured. Set GEMINI_API_KEY in local.properties"))
                }

                val model = GenerativeModel(
                    modelName = "gemini-2.5-flash",
                    apiKey = apiKey
                )

                val bitmap = uriToBitmap(context, imageUri)
                    ?: return@withContext Result.failure(Exception("Could not load image"))

                val response = model.generateContent(
                    content {
                        image(bitmap)
                        text(PROMPT)
                    }
                )

                val text = response.text ?: return@withContext Result.failure(Exception("Empty response from AI"))

                val result = parseResponse(text)
                Result.success(result)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    private fun uriToBitmap(context: Context, uri: Uri): Bitmap? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val source = ImageDecoder.createSource(context.contentResolver, uri)
                ImageDecoder.decodeBitmap(source) { decoder, _, _ ->
                    decoder.isMutableRequired = false
                    decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
                }
            } else {
                @Suppress("DEPRECATION")
                MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun parseResponse(text: String): EyeScreeningResult {
        val riskLevel = extractAfter(text, "RISK_LEVEL:")
            ?.trim()?.uppercase()?.split(" ")?.firstOrNull() ?: "MODERATE"

        val findingsBlock = extractAfter(text, "FINDINGS:")
        val recommendation = extractAfter(text, "RECOMMENDATION:")?.trim()
            ?: "Please consult an ophthalmologist for a comprehensive eye examination."

        val findings = findingsBlock?.trim() ?: "Analysis completed. Please review with a specialist."

        val validLevels = setOf("LOW", "MODERATE", "HIGH", "CRITICAL")
        val finalRisk = if (riskLevel in validLevels) riskLevel else "MODERATE"

        return EyeScreeningResult(
            riskLevel = finalRisk,
            findings = findings,
            recommendation = recommendation
        )
    }

    private fun extractAfter(text: String, marker: String): String? {
        val index = text.indexOf(marker, ignoreCase = true)
        if (index == -1) return null
        return text.substring(index + marker.length)
    }
}
