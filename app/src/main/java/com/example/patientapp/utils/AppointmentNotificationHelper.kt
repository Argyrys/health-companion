package com.example.patientapp.utils

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.example.patientapp.PatientApp
import com.example.patientapp.R
import com.example.patientapp.ui.main.MainActivity

object AppointmentNotificationHelper {

    private const val PREF_NAME = "appointment_status_cache"
    private const val KEY_PREFIX = "apt_status_"

    fun onStatusChanged(context: Context, appointmentId: String, patientName: String, doctorName: String, newStatus: String) {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val key = KEY_PREFIX + appointmentId
        val previousStatus = prefs.getString(key, "")

        if (previousStatus == newStatus) return

        prefs.edit().putString(key, newStatus).apply()

        if (previousStatus.isNullOrEmpty()) return

        val title: String
        val body: String

        when (newStatus.lowercase()) {
            "forwarded" -> {
                title = "Appointment Scheduled"
                body = "Dr. $doctorName has scheduled your appointment"
            }
            "accepted" -> {
                title = "Appointment Confirmed"
                body = "Dr. $doctorName accepted your appointment request"
            }
            "rejected" -> {
                title = "Appointment Rejected"
                body = "Dr. $doctorName could not accept your appointment"
            }
            else -> return
        }

        showNotification(context, title, body, appointmentId)
    }

    private fun showNotification(context: Context, title: String, body: String, appointmentId: String) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("openAppointments", true)
        }

        val pendingIntent = PendingIntent.getActivity(
            context, appointmentId.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, PatientApp.CHANNEL_APPOINTMENTS)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(appointmentId.hashCode(), notification)
    }
}
