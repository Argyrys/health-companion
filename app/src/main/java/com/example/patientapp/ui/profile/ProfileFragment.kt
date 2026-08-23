package com.example.patientapp.ui.profile

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.patientapp.data.model.Patient
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentProfileBinding
import com.example.patientapp.ui.auth.LoginActivity
import com.example.patientapp.ui.auth.RegisterActivity
import com.example.patientapp.utils.Constants
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.example.patientapp.utils.LocalAuthManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository
    @Inject lateinit var localAuthManager: LocalAuthManager

    private var currentPatient: Patient? = null
    private var selectedGender = ""
    private var selectedBloodGroup = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val uid = sessionManager.getUid()

        if (uid.isNullOrEmpty()) {
            showGuestView()
        } else {
            showAuthenticatedView()
            loadProfile()
        }

        // Guest buttons
        binding.btnGuestLogin.setOnClickListener {
            startActivity(Intent(requireContext(), LoginActivity::class.java))
        }
        binding.btnGuestCreateAccount.setOnClickListener {
            startActivity(Intent(requireContext(), RegisterActivity::class.java))
        }

        // Auth buttons
        binding.btnEdit.setOnClickListener { enterEditMode() }
        binding.btnSave.setOnClickListener { saveProfile() }
        binding.btnCancel.setOnClickListener { exitEditMode() }

        binding.btnEditGender.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Select Gender")
                .setItems(Constants.GENDERS.toTypedArray()) { _, which ->
                    selectedGender = Constants.GENDERS[which]
                    binding.btnEditGender.text = selectedGender
                }
                .show()
        }

        binding.btnEditBloodGroup.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Select Blood Group")
                .setItems(Constants.BLOOD_GROUPS.toTypedArray()) { _, which ->
                    selectedBloodGroup = Constants.BLOOD_GROUPS[which]
                    binding.btnEditBloodGroup.text = selectedBloodGroup
                }
                .show()
        }

        binding.btnLogout.setOnClickListener {
            localAuthManager.logout()
            sessionManager.clear()
            showGuestView()
            requireContext().showToast("Logged out successfully")
        }
    }

    private fun showGuestView() {
        binding.llGuestView.visibility = View.VISIBLE
        binding.llAuthenticatedView.visibility = View.GONE
    }

    private fun showAuthenticatedView() {
        binding.llGuestView.visibility = View.GONE
        binding.llAuthenticatedView.visibility = View.VISIBLE
    }

    private fun loadProfile() {
        val uid = sessionManager.getUid() ?: return
        CoroutineScope(Dispatchers.IO).launch {
            patientRepository.observeProfile(uid).collectLatest { patient ->
                patient?.let {
                    currentPatient = it
                    launch(Dispatchers.Main) { displayProfile(it) }
                }
            }
        }
    }

    private fun displayProfile(patient: Patient) {
        binding.tvName.text = patient.fullName.ifEmpty { "Complete your profile" }
        binding.tvEmail.text = "Email: ${patient.email.ifEmpty { sessionManager.getEmail() ?: "Not set" }}"
        binding.tvPhone.text = "Phone: ${patient.phoneNumber.ifEmpty { "Not set" }}"
        binding.tvAge.text = "Age: ${if (patient.age > 0) patient.age.toString() else "Not set"}"
        binding.tvGender.text = "Gender: ${patient.gender.ifEmpty { "Not set" }}"
        binding.tvBloodGroup.text = "Blood Group: ${patient.bloodGroup.ifEmpty { "Not set" }}"
        binding.tvHeight.text = "Height: ${patient.height.ifEmpty { "Not set" }}"
        binding.tvWeight.text = "Weight: ${patient.weight.ifEmpty { "Not set" }}"
        binding.tvAddress.text = "Address: ${patient.address.ifEmpty { "Not set" }}"
        binding.tvCity.text = "City: ${patient.city.ifEmpty { "Not set" }}"
        binding.tvEmergency.text = "Emergency: ${patient.emergencyContactName.ifEmpty { "Not set" }} (${patient.emergencyContactNumber.ifEmpty { "N/A" }})"
        binding.tvConditions.text = "Conditions: ${patient.existingConditions.ifEmpty { "None" }}"
        binding.tvLanguage.text = "Language: ${patient.preferredLanguage.ifEmpty { "Not set" }}"
    }

    private fun enterEditMode() {
        val patient = currentPatient

        binding.llViewMode.visibility = View.GONE
        binding.llEditMode.visibility = View.VISIBLE
        binding.btnEdit.visibility = View.GONE
        binding.btnSave.visibility = View.VISIBLE
        binding.btnCancel.visibility = View.VISIBLE

        binding.etEditName.setText(patient?.fullName ?: "")
        binding.etEditAge.setText(if (patient != null && patient.age > 0) patient.age.toString() else "")
        binding.etEditEmail.setText(patient?.email ?: sessionManager.getEmail() ?: "")
        binding.etEditHeight.setText(patient?.height ?: "")
        binding.etEditWeight.setText(patient?.weight ?: "")
        binding.etEditAddress.setText(patient?.address ?: "")
        binding.etEditCity.setText(patient?.city ?: "")
        binding.etEditEmergencyName.setText(patient?.emergencyContactName ?: "")
        binding.etEditEmergencyNumber.setText(patient?.emergencyContactNumber ?: "")
        binding.etEditConditions.setText(patient?.existingConditions ?: "")
        binding.etEditLanguage.setText(patient?.preferredLanguage ?: "")

        selectedGender = patient?.gender ?: ""
        selectedBloodGroup = patient?.bloodGroup ?: ""
        binding.btnEditGender.text = patient?.gender?.ifEmpty { "Select Gender" } ?: "Select Gender"
        binding.btnEditBloodGroup.text = patient?.bloodGroup?.ifEmpty { "Select Blood Group" } ?: "Select Blood Group"
    }

    private fun exitEditMode() {
        binding.llViewMode.visibility = View.VISIBLE
        binding.llEditMode.visibility = View.GONE
        binding.btnEdit.visibility = View.VISIBLE
        binding.btnSave.visibility = View.GONE
        binding.btnCancel.visibility = View.GONE
    }

    private fun saveProfile() {
        val name = binding.etEditName.text.toString().trim()
        val ageText = binding.etEditAge.text.toString().trim()

        if (name.isEmpty()) { binding.etEditName.error = "Name required"; return }
        if (ageText.isEmpty() || ageText.toIntOrNull() == null) { binding.etEditAge.error = "Valid age required"; return }
        if (selectedGender.isEmpty()) { requireContext().showToast("Select gender"); return }
        if (selectedBloodGroup.isEmpty()) { requireContext().showToast("Select blood group"); return }

        val uid = sessionManager.getUid() ?: return
        val updated = Patient(
            uid = uid,
            fullName = name,
            age = ageText.toInt(),
            gender = selectedGender,
            phoneNumber = currentPatient?.phoneNumber ?: "",
            email = binding.etEditEmail.text.toString().trim(),
            bloodGroup = selectedBloodGroup,
            height = binding.etEditHeight.text.toString().trim(),
            weight = binding.etEditWeight.text.toString().trim(),
            address = binding.etEditAddress.text.toString().trim(),
            city = binding.etEditCity.text.toString().trim(),
            emergencyContactName = binding.etEditEmergencyName.text.toString().trim(),
            emergencyContactNumber = binding.etEditEmergencyNumber.text.toString().trim(),
            existingConditions = binding.etEditConditions.text.toString().trim(),
            preferredLanguage = binding.etEditLanguage.text.toString().trim()
        )

        binding.progressBar.visibility = View.VISIBLE
        binding.btnSave.isEnabled = false

        CoroutineScope(Dispatchers.IO).launch {
            val result = patientRepository.saveProfile(updated)
            launch(Dispatchers.Main) {
                binding.progressBar.visibility = View.GONE
                binding.btnSave.isEnabled = true
                if (result is com.example.patientapp.utils.Resource.Success) {
                    currentPatient = updated
                    displayProfile(updated)
                    exitEditMode()
                    requireContext().showToast("Profile updated successfully")
                } else {
                    requireContext().showToast("Failed to update profile")
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
