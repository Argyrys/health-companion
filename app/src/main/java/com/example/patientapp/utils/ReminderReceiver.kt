package com.example.patientapp.utils

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.speech.tts.TextToSpeech
import androidx.core.app.NotificationCompat
import com.example.patientapp.PatientApp
import com.example.patientapp.R
import com.example.patientapp.ui.main.MainActivity
import java.util.Locale

class ReminderReceiver : BroadcastReceiver(), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var spoken = false

    override fun onReceive(context: Context, intent: Intent) {
        val medicationName = intent.getStringExtra("medicationName") ?: "your medicine"
        val reminderId = intent.getIntExtra("reminderId", System.currentTimeMillis().toInt())
        val action = intent.getStringExtra("action")

        when (action) {
            "TAKEN" -> {
                // Mark as taken
                val takenIntent = Intent(context, ReminderActionReceiver::class.java).apply {
                    putExtra("reminderId", reminderId)
                    putExtra("status", "taken")
                }
                context.sendBroadcast(takenIntent)
                // Cancel notification
                val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                manager.cancel(reminderId)
                return
            }
            "SKIP" -> {
                // Mark as skipped
                val skipIntent = Intent(context, ReminderActionReceiver::class.java).apply {
                    putExtra("reminderId", reminderId)
                    putExtra("status", "skipped")
                }
                context.sendBroadcast(skipIntent)
                // Cancel notification
                val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                manager.cancel(reminderId)
                return
            }
        }

        // Original reminder - show notification and speak
        // Text-to-Speech
        tts = TextToSpeech(context.applicationContext, this)

        // Open app intent
        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context, reminderId, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Taken action intent
        val takenActionIntent = Intent(context, ReminderReceiver::class.java).apply {
            putExtra("medicationName", medicationName)
            putExtra("reminderId", reminderId)
            putExtra("action", "TAKEN")
        }
        val takenPendingIntent = PendingIntent.getBroadcast(
            context, reminderId + 1000, takenActionIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Skip action intent
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
                .bigText("It is time to take your $medicationName. Have you taken it?"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .addAction(R.drawable.bg_button_primary, "TAKEN", takenPendingIntent)
            .addAction(R.drawable.bg_button_secondary, "SKIP", skipPendingIntent)
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(reminderId, notification)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS && !spoken) {
            tts?.language = Locale.US
            tts?.speak("It is time to take your medicine.", TextToSpeech.QUEUE_FLUSH, null, "reminder")
            spoken = true
        }
    }
}
