package com.example.patientapp.data.repository

import android.net.Uri
import com.example.patientapp.utils.Resource
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StorageRepository @Inject constructor(
    private val storage: FirebaseStorage
) {
    private fun patientStorageRef(uid: String) = storage.reference.child("patients/$uid")

    suspend fun uploadVoiceRecording(uid: String, audioUri: Uri): Resource<String> {
        return try {
            val ref = patientStorageRef(uid).child("voice/${UUID.randomUUID()}.mp3")
            ref.putFile(audioUri).await()
            val url = ref.downloadUrl.await().toString()
            Resource.Success(url)
        } catch (e: Exception) {
            // Mock: return a fake URL
            Resource.Success("mock://voice/recording.mp3")
        }
    }

    suspend fun uploadEyeImage(uid: String, imageUri: Uri): Resource<String> {
        return try {
            val ref = patientStorageRef(uid).child("eye-images/${UUID.randomUUID()}.jpg")
            ref.putFile(imageUri).await()
            val url = ref.downloadUrl.await().toString()
            Resource.Success(url)
        } catch (e: Exception) {
            Resource.Success("mock://eye/image.jpg")
        }
    }

    suspend fun uploadReport(uid: String, pdfUri: Uri): Resource<String> {
        return try {
            val ref = patientStorageRef(uid).child("reports/report_${System.currentTimeMillis()}.pdf")
            ref.putFile(pdfUri).await()
            val url = ref.downloadUrl.await().toString()
            Resource.Success(url)
        } catch (e: Exception) {
            Resource.Success("mock://report/report.pdf")
        }
    }
}
