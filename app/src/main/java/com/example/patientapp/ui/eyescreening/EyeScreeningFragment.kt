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
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.example.patientapp.R
import com.example.patientapp.data.model.EyeScreening
import com.example.patientapp.data.repository.EyeScreeningAnalyzer
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.data.repository.StorageRepository
import com.example.patientapp.databinding.FragmentEyeScreeningBinding
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.firebase.Timestamp
import dagger.hilt.android.AndroidEntryPoint
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

        binding.progressBar.visibility = View.VISIBLE
        binding.btnCapture.isEnabled = false

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            // 1. Analyze with Gemini AI (primary — must succeed)
            val aiResult = EyeScreeningAnalyzer.analyze(requireContext(), uri)

            val riskLevel: String
            val findings: String
            val recommendation: String

            if (aiResult.isSuccess) {
                val result = aiResult.getOrNull()!!
                riskLevel = result.riskLevel
                findings = result.findings
                recommendation = result.recommendation
            } else {
                // Fallback if AI fails
                riskLevel = "MODERATE"
                findings = "AI analysis unavailable: ${aiResult.exceptionOrNull()?.message}\nPlease consult an ophthalmologist for professional assessment."
                recommendation = "Schedule a comprehensive eye examination with a qualified ophthalmologist for accurate diagnosis."
            }

            // 2. Upload image and save to Firestore (best-effort, non-blocking)
            val uid = sessionManager.getUid()
            if (uid != null) {
                try {
                    val uploadResult = storageRepository.uploadEyeImage(uid, uri)
                    val imageUrl = if (uploadResult is com.example.patientapp.utils.Resource.Success) uploadResult.data else ""

                    val screening = EyeScreening(
                        id = UUID.randomUUID().toString(),
                        patientId = uid,
                        imageUrl = imageUrl,
                        riskLevel = riskLevel,
                        aiAssessment = findings,
                        createdAt = Timestamp.now()
                    )
                    patientRepository.saveEyeScreening(screening)
                } catch (e: Exception) {
                    // Upload/save failed — still show AI results
                }
            }

            // 3. Show results regardless of upload status
            if (_binding != null) {
                launch(Dispatchers.Main) {
                    if (_binding == null) return@launch
                    binding.progressBar.visibility = View.GONE
                    binding.btnCapture.isEnabled = true
                    showDetailedResult(riskLevel, findings, recommendation)
                }
            }
        }
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
