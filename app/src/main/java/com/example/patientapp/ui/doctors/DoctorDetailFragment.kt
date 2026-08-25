package com.example.patientapp.ui.doctors

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.patientapp.data.model.AppointmentRequest
import com.example.patientapp.databinding.FragmentDoctorDetailBinding
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class DoctorDetailFragment : Fragment() {

    private var _binding: FragmentDoctorDetailBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var firestore: FirebaseFirestore

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDoctorDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val doctorId = arguments?.getString("doctorId") ?: ""
        val doctorName = arguments?.getString("doctorName") ?: ""
        val specialty = arguments?.getString("specialty") ?: ""
        val qualification = arguments?.getString("qualification") ?: ""
        val experience = arguments?.getString("experience") ?: ""
        val hospital = arguments?.getString("hospital") ?: ""

        binding.tvDoctorName.text = doctorName
        binding.tvSpecialty.text = specialty
        binding.tvQualification.text = "Qualification: $qualification"
        binding.tvExperience.text = "Experience: $experience"
        binding.tvHospital.text = "Hospital: $hospital"

        binding.btnAttachReport.setOnClickListener {
            requireContext().showToast("Report attached from your records")
            binding.tvAttachedReport.text = "\uD83D\uDCC4 Attached: Patient Health Report"
            binding.tvAttachedReport.visibility = View.VISIBLE
        }

        binding.btnSendRequest.setOnClickListener {
            val message = binding.etMessage.text.toString().trim()
            if (message.isEmpty()) {
                requireContext().showToast("Please describe your reason for visit")
                return@setOnClickListener
            }
            sendAppointmentRequest(doctorId, doctorName, message)
        }
    }

    private fun sendAppointmentRequest(doctorId: String, doctorName: String, message: String) {
        binding.progressBar.visibility = View.VISIBLE
        binding.btnSendRequest.isEnabled = false

        val patientId = sessionManager.getUid() ?: ""
        val patientEmail = sessionManager.getEmail() ?: ""

        val request = AppointmentRequest(
            patientId = patientId,
            patientName = patientEmail,
            doctorId = doctorId,
            doctorName = doctorName,
            message = message,
            status = "Pending",
            createdAt = Timestamp.now()
        )

        firestore.collection("appointments")
            .add(request)
            .addOnSuccessListener { docRef ->
                if (!isAdded) return@addOnSuccessListener
                binding.progressBar.visibility = View.GONE
                binding.btnSendRequest.isEnabled = true
                requireContext().showToast("Appointment request sent to $doctorName")
                binding.etMessage.text?.clear()

                // Also link patient to doctor in patients collection
                if (patientId.isNotEmpty()) {
                    firestore.collection("patients").document(patientId)
                        .update("doctorId", doctorId, "doctorName", doctorName)
                }
            }
            .addOnFailureListener { e ->
                if (!isAdded) return@addOnFailureListener
                binding.progressBar.visibility = View.GONE
                binding.btnSendRequest.isEnabled = true
                requireContext().showToast("Failed to send request: ${e.message}")
            }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
