package com.example.patientapp

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class PatientApp : Application() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val reminderChannel = NotificationChannel(
                CHANNEL_REMINDERS,
                "Medication Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Reminders to take your medication"
                enableVibration(true)
            }

            val diagnosisChannel = NotificationChannel(
                CHANNEL_DIAGNOSIS,
                "Doctor Updates",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications about doctor diagnosis and prescriptions"
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(reminderChannel)
            manager.createNotificationChannel(diagnosisChannel)
        }
    }

    companion object {
        const val CHANNEL_REMINDERS = "medication_reminders"
        const val CHANNEL_DIAGNOSIS = "doctor_diagnosis"
    }
}
