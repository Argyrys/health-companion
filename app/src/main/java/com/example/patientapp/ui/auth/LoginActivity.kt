package com.example.patientapp.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.example.patientapp.databinding.ActivityLoginBinding
import com.example.patientapp.ui.main.MainActivity
import com.example.patientapp.utils.LocalAuthManager
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var localAuthManager: LocalAuthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnLogin.setOnClickListener { login() }

        binding.tvCreateAccount.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        binding.tvBack.setOnClickListener { finish() }
    }

    private fun login() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        // Clear previous errors
        binding.tilEmail.error = null
        binding.tilPassword.error = null

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

        showLoading(true)

        val result = localAuthManager.login(email, password)
        showLoading(false)

        result.fold(
            onSuccess = { uid ->
                sessionManager.saveUid(uid)
                sessionManager.saveEmail(email)
                startActivity(Intent(this, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                })
                finish()
            },
            onFailure = { e ->
                showToast(e.message ?: "Login failed")
            }
        )
    }

    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.btnLogin.isEnabled = !show
    }
}
