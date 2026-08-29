package com.example.patientapp.utils

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.example.patientapp.PatientApp
import com.example.patientapp.R
import com.example.patientapp.ui.medicationreminder.MedicationReminderActivity

class ReminderReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val medicationName = intent.getStringExtra("medicationName") ?: "your medicine"
        val reminderId = intent.getIntExtra("reminderId", System.currentTimeMillis().toInt())
        val action = intent.getStringExtra("action")

        when (action) {
            "FIRE" -> {
                // Launch the voice reminder reliably via a foreground service.
                ReminderFireService.start(context, medicationName, reminderId)
                return
            }
            "TAKEN" -> {
                val takenIntent = Intent(context, ReminderActionReceiver::class.java).apply {
                    putExtra("reminderId", reminderId)
                    putExtra("status", "taken")
                    putExtra("medicationName", medicationName)
                }
                context.sendBroadcast(takenIntent)
                val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                manager.cancel(reminderId)
                return
            }
            "SKIP" -> {
                val skipIntent = Intent(context, ReminderActionReceiver::class.java).apply {
                    putExtra("reminderId", reminderId)
                    putExtra("status", "skipped")
                    putExtra("medicationName", medicationName)
                }
                context.sendBroadcast(skipIntent)
                val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                manager.cancel(reminderId)
                return
            }
        }

        // Route through a foreground service so the voice reminder launches even
        // when the app is closed or the screen is locked (foreground services are
        // exempt from background-activity-start restrictions).
        ReminderFireService.start(context, medicationName, reminderId)

        // PendingIntent for the voice reminder activity (used as full-screen intent)
        val reminderActivityIntent = Intent(context, MedicationReminderActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
            putExtra("medicationName", medicationName)
            putExtra("reminderId", reminderId)
        }
        val reminderPendingIntent = PendingIntent.getActivity(
            context, reminderId + 3000, reminderActivityIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Notification with full-screen intent so it shows on lock screen as a
        // fallback if the activity launch is ever blocked.
        val takenActionIntent = Intent(context, ReminderReceiver::class.java).apply {
            putExtra("medicationName", medicationName)
            putExtra("reminderId", reminderId)
            putExtra("action", "TAKEN")
        }
        val takenPendingIntent = PendingIntent.getBroadcast(
            context, reminderId + 1000, takenActionIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val skipActionIntent = Intent(context, ReminderReceiver::class.java).apply {
            putExtra("medicationName", medicationName)
            putExtra("reminderId", reminderId)
            putExtra("action", "SKIP")
        }
        val skipPendingIntent = PendingIntent.getBroadcast(
            context, reminderId + 2000, skipActionIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, PatientApp.CHANNEL_REMINDERS)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Medication Reminder")
            .setContentText("Time to take your $medicationName")
            .setStyle(NotificationCompat.BigTextStyle()
                .bigText("Have you taken your $medicationName?\n• Tap the notification to answer by voice\n• Or use the buttons below"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(reminderPendingIntent, true)
            .setContentIntent(reminderPendingIntent)
            .setAutoCancel(true)
            .addAction(R.drawable.bg_button_primary, "TAKEN", takenPendingIntent)
            .addAction(R.drawable.bg_button_secondary, "SKIP", skipPendingIntent)
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(reminderId, notification)
    }
}
