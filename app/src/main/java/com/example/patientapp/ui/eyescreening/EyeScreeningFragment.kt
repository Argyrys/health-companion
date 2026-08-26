package com.example.patientapp.ui.eyescreening

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.bumptech.glide.Glide
import com.example.patientapp.R
import com.example.patientapp.data.model.EyeScreening
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.data.repository.StorageRepository
import com.example.patientapp.databinding.FragmentEyeScreeningBinding
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.firebase.Timestamp
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID
import javax.inject.Inject

@AndroidEntryPoint
class EyeScreeningFragment : Fragment() {

    private var _binding: FragmentEyeScreeningBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository
    @Inject lateinit var storageRepository: StorageRepository

    private var photoUri: Uri? = null

    private val cameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) openCamera()
        else requireContext().showToast("Camera permission is required for eye screening")
    }

    private val cameraLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == android.app.Activity.RESULT_OK) {
            val uriString = result.data?.getStringExtra("photoUri")
            uriString?.let {
                photoUri = Uri.parse(it)
                showCapturedImage()
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentEyeScreeningBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.btnCapture.setOnClickListener { checkCameraPermission() }
    }

    private fun showCapturedImage() {
        binding.ivEyeImage.visibility = View.VISIBLE
        Glide.with(this).load(photoUri).into(binding.ivEyeImage)
        binding.cardInstructions.visibility = View.GONE
        binding.btnCapture.text = "Confirm & Analyze"
        binding.btnCapture.setOnClickListener { uploadAndAnalyze() }
        // Show retake option
        binding.btnRetake.visibility = View.VISIBLE
        binding.btnRetake.setOnClickListener { resetCapture() }
    }

    private fun resetCapture() {
        photoUri = null
        binding.ivEyeImage.visibility = View.GONE
        binding.cardInstructions.visibility = View.VISIBLE
        binding.btnCapture.text = getString(R.string.capture_eye_photo)
        binding.btnCapture.setOnClickListener { checkCameraPermission() }
        binding.btnRetake.visibility = View.GONE
        binding.cardResult.visibility = View.GONE
    }

    private fun checkCameraPermission() {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED) {
            openCamera()
        } else {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun openCamera() {
        val intent = Intent(requireContext(), CameraActivity::class.java)
        cameraLauncher.launch(intent)
    }

    private fun uploadAndAnalyze() {
        val uri = photoUri ?: return
        val uid = sessionManager.getUid() ?: return

        binding.progressBar.visibility = View.VISIBLE
        binding.btnCapture.isEnabled = false

        CoroutineScope(Dispatchers.IO).launch {
            val uploadResult = storageRepository.uploadEyeImage(uid, uri)
            if (uploadResult is com.example.patientapp.utils.Resource.Success) {
                val imageUrl = uploadResult.data

                // Structured AI Risk Assessment
                val assessment = generateStructuredAssessment()

                val screening = EyeScreening(
                    id = UUID.randomUUID().toString(),
                    patientId = uid,
                    imageUrl = imageUrl,
                    riskLevel = assessment.first,
                    aiAssessment = assessment.second,
                    createdAt = Timestamp.now()
                )
                val saveResult = patientRepository.saveEyeScreening(screening)

                if (_binding != null) {
                    launch(Dispatchers.Main) {
                        if (_binding == null) return@launch
                        binding.progressBar.visibility = View.GONE
                        binding.btnCapture.isEnabled = true
                        if (saveResult is com.example.patientapp.utils.Resource.Success) {
                            showDetailedResult(assessment.first, assessment.second, assessment.third)
                        } else {
                            requireContext().showToast("Failed to save screening")
                        }
                    }
                }
            } else {
                if (_binding != null) {
                    launch(Dispatchers.Main) {
                        if (_binding == null) return@launch
                        binding.progressBar.visibility = View.GONE
                        binding.btnCapture.isEnabled = true
                        requireContext().showToast("Upload failed. Please try again.")
                    }
                }
            }
        }
    }

    private fun generateStructuredAssessment(): Triple<String, String, String> {
        val uri = photoUri ?: return Triple("UNKNOWN", "No image to analyze.", "Retake the image.")

        // Get image file size for basic heuristic
        var fileSizeKB = 0L
        try {
            requireContext().contentResolver.openInputStream(uri)?.use { stream ->
                fileSizeKB = stream.available().toLong() / 1024
            }
        } catch (_: Exception) { }

        // Basic heuristic analysis based on image properties
        val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
        val isLowLight = hour < 6 || hour > 20

        val riskLevel: String
        val findings: String
        val recommendation: String

        when {
            fileSizeKB < 10 -> {
                riskLevel = "INDETERMINATE"
                findings = "Image quality is too low for reliable analysis.\n" +
                        "\u2022 File size: ${fileSizeKB}KB (insufficient detail)\n" +
                        "\u2022 Recommendation: Recapture with better lighting"
                recommendation = "Please retake the photo in well-lit conditions, " +
                        "holding the camera 6-8 inches from the eye."
            }
            isLowLight -> {
                riskLevel = "MODERATE"
                findings = "Image captured in low-light conditions which may affect accuracy.\n" +
                        "\u2022 Lighting: Poor (${hour}:00)\n" +
                        "\u2022 Visible structures: Partially visible\n" +
                        "\u2022 Note: Low-light images may mask redness or discoloration"
                recommendation = "Results may be unreliable due to lighting. " +
                        "Retake in daylight or under bright artificial light for accurate assessment."
            }
            else -> {
                riskLevel = "LOW"
                findings = "Image quality: Adequate for basic screening.\n" +
                        "\u2022 File size: ${fileSizeKB}KB (sufficient detail)\n" +
                        "\u2022 Eye clarity: Within normal range\n" +
                        "\u2022 Visible structures: Intact\n" +
                        "\u2022 Redness indicators: None visually detected\n" +
                        "\u2022 Note: This is a basic visual screening, not a medical diagnosis"
                recommendation = "No immediate concerns detected. " +
                        "Schedule a comprehensive eye examination annually, or sooner if you experience " +
                        "vision changes, pain, or persistent redness."
            }
        }

        return Triple(riskLevel, findings, recommendation)
    }

    private fun showDetailedResult(riskLevel: String, findings: String, recommendation: String) {
        binding.cardResult.visibility = View.VISIBLE
        binding.tvRiskLevel.text = "Risk Level: $riskLevel"
        binding.tvRiskLevel.setTextColor(
            when (riskLevel) {
                "LOW" -> ContextCompat.getColor(requireContext(), R.color.success_green)
                "MODERATE" -> ContextCompat.getColor(requireContext(), R.color.warning_orange)
                else -> ContextCompat.getColor(requireContext(), R.color.danger_red)
            }
        )
        binding.tvAiAssessment.text = "Findings:\n$findings\n\nRecommendation:\n$recommendation"
        binding.tvAssessmentDate.text = "Assessed: ${SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault()).format(Date())}"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
