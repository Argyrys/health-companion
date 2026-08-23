package com.example.patientapp.data.repository

import com.example.patientapp.utils.Resource
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthProvider
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val auth: FirebaseAuth
) {
    val currentUser get() = auth.currentUser
    val currentUid get() = auth.currentUser?.uid

    suspend fun verifyOtp(verificationId: String, otp: String): Resource<Unit> {
        return try {
            val credential = PhoneAuthProvider.getCredential(verificationId, otp)
            auth.signInWithCredential(credential).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Verification failed")
        }
    }

    suspend fun signInWithCredential(credential: PhoneAuthCredential): Resource<Unit> {
        return try {
            auth.signInWithCredential(credential).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Sign in failed")
        }
    }

    fun signOut() {
        auth.signOut()
    }
}
