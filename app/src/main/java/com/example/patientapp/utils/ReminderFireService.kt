package com.example.patientapp.utils

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.example.patientapp.PatientApp
import com.example.patientapp.ui.medicationreminder.MedicationReminderActivity

/**
 * Foreground service that reliably launches the voice medication reminder.
 *
 * The reminder alarm hands off to this service, which calls [startForeground]
 * with a visible, high-priority notification. A foreground service is exempt
 * from Android's background-activity-start restriction, so [MedicationReminderActivity]
 * launches even when the phone is locked or the app is fully closed. The service
 * then stops itself once the reminder screen is up.
 */
class ReminderFireService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startForegroundWithNotification()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val medicationName = intent?.getStringExtra("medicationName") ?: "your medicine"
        val reminderId = intent?.getIntExtra("reminderId", 0) ?: 0
        launchReminderActivity(medicationName, reminderId)
        return START_NOT_STICKY
    }

    private fun startForegroundWithNotification() {
        val openIntent = Intent(this, MedicationReminderActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification: Notification = NotificationCompat.Builder(this, PatientApp.CHANNEL_REMINDERS)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Medication Reminder")
            .setContentText("Time to take your medicine")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                IN_FOREGROUND_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(IN_FOREGROUND_ID, notification)
        }
    }

    private fun launchReminderActivity(medicationName: String, reminderId: Int) {
        val reminderIntent = Intent(this, MedicationReminderActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra("medicationName", medicationName)
            putExtra("reminderId", reminderId)
        }
        try {
            startActivity(reminderIntent)
        } catch (_: Exception) {
            // Activity launch blocked — notification remains as fallback
        }
        stopSelf()
    }

    companion object {
        const val IN_FOREGROUND_ID = 9001

        fun start(context: Context, medicationName: String, reminderId: Int) {
            val intent = Intent(context, ReminderFireService::class.java).apply {
                putExtra("medicationName", medicationName)
                putExtra("reminderId", reminderId)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }
}
