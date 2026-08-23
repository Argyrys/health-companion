package com.example.patientapp.ui.registration

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import androidx.appcompat.app.AppCompatActivity
import com.example.patientapp.R
import com.example.patientapp.data.model.Patient
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.ActivityRegistrationBinding
import com.example.patientapp.ui.main.MainActivity
import com.example.patientapp.utils.Constants
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class RegistrationActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegistrationBinding

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var auth: FirebaseAuth
    @Inject lateinit var firestore: FirebaseFirestore
    @Inject lateinit var patientRepository: PatientRepository

    private var selectedGender = ""
    private var selectedBloodGroup = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegistrationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.etPhone.setText(sessionManager.getPhone()?.replace("+91", "") ?: "")

        binding.btnGender.setOnClickListener { showGenderPicker() }
        binding.btnBloodGroup.setOnClickListener { showBloodGroupPicker() }

        binding.btnContinue.setOnClickListener {
            if (validate()) {
                saveProfile()
            }
        }
    }

    private fun showGenderPicker() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Select Gender")
            .setItems(Constants.GENDERS.toTypedArray()) { _, which ->
                selectedGender = Constants.GENDERS[which]
                binding.btnGender.text = selectedGender
            }
            .show()
    }

    private fun showBloodGroupPicker() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Select Blood Group")
            .setItems(Constants.BLOOD_GROUPS.toTypedArray()) { _, which ->
                selectedBloodGroup = Constants.BLOOD_GROUPS[which]
                binding.btnBloodGroup.text = selectedBloodGroup
            }
            .show()
    }

    private fun validate(): Boolean {
        val name = binding.etName.text.toString().trim()
        val age = binding.etAge.text.toString().trim()

        if (name.isEmpty()) {
            binding.tilName.error = "Name is required"
            return false
        }
        if (age.isEmpty() || age.toIntOrNull() == null) {
            binding.tilAge.error = "Valid age is required"
            return false
        }
        if (selectedGender.isEmpty()) {
            showToast("Please select gender")
            return false
        }
        if (selectedBloodGroup.isEmpty()) {
            showToast("Please select blood group")
            return false
        }
        return true
    }

    private fun saveProfile() {
        showLoading(true)

        val uid = auth.currentUser?.uid ?: run {
            showLoading(false)
            showToast("Authentication error")
            return
        }

        val patient = Patient(
            uid = uid,
            fullName = binding.etName.text.toString().trim(),
            age = binding.etAge.text.toString().trim().toInt(),
            gender = selectedGender,
            phoneNumber = sessionManager.getPhone() ?: "",
            bloodGroup = selectedBloodGroup,
            createdAt = Timestamp.now(),
            updatedAt = Timestamp.now()
        )

        CoroutineScope(Dispatchers.IO).launch {
            val result = patientRepository.saveProfile(patient)
            launch(Dispatchers.Main) {
                showLoading(false)
                if (result.isSuccess) {
                    sessionManager.setRegistered(true)
                    showToast(getString(R.string.registration_success))
                    startActivity(Intent(this@RegistrationActivity, MainActivity::class.java))
                    finish()
                } else {
                    showToast(result.toString())
                }
            }
        }
    }

    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.btnContinue.isEnabled = !show
    }
}
