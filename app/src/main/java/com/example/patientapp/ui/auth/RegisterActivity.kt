package com.example.patientapp.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.patientapp.R
import com.example.patientapp.databinding.ActivityRegisterBinding
import com.example.patientapp.ui.main.MainActivity
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

@AndroidEntryPoint
class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private lateinit var googleSignInClient: GoogleSignInClient

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var auth: FirebaseAuth
    @Inject lateinit var firestore: FirebaseFirestore

    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            val token = account.idToken
            if (token != null) {
                firebaseAuthWithGoogle(token)
            } else {
                showLoading(false)
                showToast("Google sign up failed: no token")
            }
        } catch (e: ApiException) {
            showLoading(false)
            showToast("Google sign up failed")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)

        binding.btnCreateAccount.setOnClickListener { createAccount() }
        binding.btnGoogleSignIn.setOnClickListener { googleSignIn() }
        binding.tvLogin.setOnClickListener { finish() }
    }

    private fun googleSignIn() {
        showLoading(true)
        googleSignInLauncher.launch(googleSignInClient.signInIntent)
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        lifecycleScope.launch {
            try {
                val result = auth.signInWithCredential(credential).await()
                val user = result.user
                if (user != null) {
                    val uid = user.uid
                    val email = user.email ?: ""
                    val name = user.displayName ?: ""

                    sessionManager.saveUid(uid)
                    sessionManager.saveEmail(email)

                    val profileDoc = firestore.collection("patients").document(uid)
                        .collection("data").document("profile")
                    val snapshot = profileDoc.get().await()
                    if (!snapshot.exists()) {
                        profileDoc.set(hashMapOf(
                            "uid" to uid,
                            "fullName" to name,
                            "email" to email,
                            "phoneNumber" to "",
                            "gender" to "",
                            "bloodGroup" to "",
                            "height" to "",
                            "weight" to "",
                            "address" to "",
                            "city" to "",
                            "emergencyContactName" to "",
                            "emergencyContactNumber" to "",
                            "existingConditions" to "",
                            "preferredLanguage" to "English",
                            "age" to 0,
                            "updatedAt" to com.google.firebase.Timestamp.now()
                        )).await()
                    }

                    uploadFCMToken(uid)
                    showToast("Account created successfully")
                    startActivity(Intent(this@RegisterActivity, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    })
                    finish()
                } else {
                    showToast("Google sign up failed — no user")
                }
            } catch (e: Exception) {
                showToast(e.message ?: "Google sign up failed")
            } finally {
                if (!isFinishing) showLoading(false)
            }
        }
    }

    private fun createAccount() {
        val name = binding.etName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()
        val confirmPassword = binding.etConfirmPassword.text.toString().trim()

        binding.tilName.error = null
        binding.tilEmail.error = null
        binding.tilPassword.error = null
        binding.tilConfirmPassword.error = null

        if (name.isEmpty()) {
            binding.tilName.error = "Name is required"
            return
        }
        if (email.isEmpty()) {
            binding.tilEmail.error = "Email is required"
            return
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = "Enter a valid email"
            return
        }
        if (password.isEmpty()) {
            binding.tilPassword.error = "Password is required"
            return
        }
        if (password.length < 6) {
            binding.tilPassword.error = "Password must be at least 6 characters"
            return
        }
        if (password != confirmPassword) {
            binding.tilConfirmPassword.error = "Passwords do not match"
            return
        }

        showLoading(true)

        lifecycleScope.launch {
            try {
                val result = auth.createUserWithEmailAndPassword(email, password).await()
                val uid = result.user?.uid
                if (uid != null) {
                    val patientProfile = hashMapOf(
                        "uid" to uid,
                        "fullName" to name,
                        "email" to email,
                        "phoneNumber" to "",
                        "gender" to "",
                        "bloodGroup" to "",
                        "height" to "",
                        "weight" to "",
                        "address" to "",
                        "city" to "",
                        "emergencyContactName" to "",
                        "emergencyContactNumber" to "",
                        "existingConditions" to "",
                        "preferredLanguage" to "English",
                        "age" to 0,
                        "updatedAt" to com.google.firebase.Timestamp.now()
                    )
                    firestore.collection("patients").document(uid)
                        .collection("data").document("profile")
                        .set(patientProfile).await()

                    sessionManager.saveUid(uid)
                    sessionManager.saveEmail(email)
                    showToast("Account created successfully")
                    startActivity(Intent(this@RegisterActivity, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    })
                    finish()
                } else {
                    showToast("Registration failed — no user returned")
                }
            } catch (e: Exception) {
                showToast(e.message ?: "Registration failed")
            } finally {
                if (isFinishing) return@launch
                showLoading(false)
            }
        }
    }

    private fun uploadFCMToken(uid: String) {
        com.google.firebase.messaging.FirebaseMessaging.getInstance().token
            .addOnSuccessListener { token ->
                firestore.collection("patients").document(uid)
                    .collection("data").document("profile")
                    .update("fcmToken", token)
            }
    }

    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.btnCreateAccount.isEnabled = !show
        binding.btnGoogleSignIn.isEnabled = !show
    }
}
