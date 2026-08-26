package com.example.patientapp.data.repository

import android.content.Context
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.util.Base64
import com.example.patientapp.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.net.HttpURLConnection
import java.net.URL

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
                    return@withContext Result.failure(Exception("Gemini API key not configured"))
                }

                val bitmap = uriToBitmap(context, imageUri)
                    ?: return@withContext Result.failure(Exception("Could not load image"))

                val base64Image = bitmapToBase64(bitmap)

                val requestBody = JSONObject().apply {
                    put("contents", JSONArray().put(
                        JSONObject().apply {
                            put("parts", JSONArray()
                                .put(JSONObject().apply {
                                    put("inline_data", JSONObject().apply {
                                        put("mime_type", "image/jpeg")
                                        put("data", base64Image)
                                    })
                                })
                                .put(JSONObject().apply {
                                    put("text", PROMPT)
                                })
                            )
                        }
                    ))
                    put("generationConfig", JSONObject().apply {
                        put("temperature", 0.4)
                        put("maxOutputTokens", 1024)
                    })
                }

                val url = URL("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 30000
                conn.readTimeout = 60000

                conn.outputStream.use { os ->
                    os.write(requestBody.toString().toByteArray(Charsets.UTF_8))
                }

                val code = conn.responseCode
                val responseBody = if (code in 200..299) {
                    conn.inputStream.bufferedReader().readText()
                } else {
                    val error = conn.errorStream?.bufferedReader()?.readText() ?: "Unknown error"
                    return@withContext Result.failure(Exception("API error $code: $error"))
                }

                val json = JSONObject(responseBody)
                val text = json.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text")

                Result.success(parseResponse(text))
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

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val maxSize = 1024
        val scaled = if (bitmap.width > maxSize || bitmap.height > maxSize) {
            val ratio = minOf(maxSize.toFloat() / bitmap.width, maxSize.toFloat() / bitmap.height)
            Bitmap.createScaledBitmap(bitmap, (bitmap.width * ratio).toInt(), (bitmap.height * ratio).toInt(), true)
        } else {
            bitmap
        }
        val stream = ByteArrayOutputStream()
        scaled.compress(Bitmap.CompressFormat.JPEG, 85, stream)
        return Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
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
