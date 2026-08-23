package com.example.patientapp.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.example.patientapp.R
import com.example.patientapp.databinding.ActivityOtpVerificationBinding
import com.example.patientapp.ui.main.MainActivity
import com.example.patientapp.ui.registration.RegistrationActivity
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

@AndroidEntryPoint
class OtpVerificationActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOtpVerificationBinding

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var auth: FirebaseAuth
    @Inject lateinit var firestore: FirebaseFirestore

    private var verificationId: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOtpVerificationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        verificationId = intent.getStringExtra("verificationId") ?: ""

        if (intent.getBooleanExtra("autoVerified", false)) {
            onVerificationSuccess()
            return
        }

        binding.btnVerify.setOnClickListener {
            val otp = binding.etOtp.text.toString().trim()
            if (otp.length != 6) {
                binding.tilOtp.error = getString(R.string.invalid_otp)
                return@setOnClickListener
            }
            binding.tilOtp.error = null
            verifyOtp(otp)
        }

        binding.tvResend.setOnClickListener {
            showToast(getString(R.string.otp_sent))
        }
    }

    private fun verifyOtp(otp: String) {
        showLoading(true)
        val credential = PhoneAuthProvider.getCredential(verificationId, otp)

        auth.signInWithCredential(credential)
            .addOnSuccessListener {
                val uid = auth.currentUser?.uid ?: ""
                sessionManager.saveUid(uid)

                CoroutineScope(Dispatchers.IO).launch {
                    val doc = firestore.collection("patients").document(uid)
                        .collection("data").document("profile").get().await()
                    launch(Dispatchers.Main) {
                        if (doc.exists() && sessionManager.isRegistered()) {
                            onVerificationSuccess()
                        } else {
                            onVerificationSuccess()
                        }
                    }
                }
            }
            .addOnFailureListener {
                showLoading(false)
                showToast(it.message ?: getString(R.string.otp_failed))
            }
    }

    private fun onVerificationSuccess() {
        showLoading(false)
        val uid = auth.currentUser?.uid ?: ""
        sessionManager.saveUid(uid)

        CoroutineScope(Dispatchers.IO).launch {
            val doc = firestore.collection("patients").document(uid)
                .collection("data").document("profile").get().await()
            launch(Dispatchers.Main) {
                if (doc.exists() && doc.getString("fullName") != null && sessionManager.isRegistered()) {
                    startActivity(Intent(this@OtpVerificationActivity, MainActivity::class.java))
                } else {
                    startActivity(Intent(this@OtpVerificationActivity, RegistrationActivity::class.java))
                }
                finish()
            }
        }
    }

    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.btnVerify.isEnabled = !show
    }
}
