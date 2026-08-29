package com.example.patientapp.utils

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.example.patientapp.data.model.Reminder
import com.google.firebase.firestore.FirebaseFirestore
import java.util.Calendar

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

        val uid = SessionManager(context).getUid() ?: return

        val firestore = FirebaseFirestore.getInstance()
        firestore.collection("patients")
            .document(uid)
            .collection("data")
            .document("reminderData")
            .collection("reminders")
            .whereEqualTo("isActive", true)
            .get()
            .addOnSuccessListener { documents ->
                for (document in documents) {
                    val reminder = document.toObject(Reminder::class.java)
                    if (reminder.isActive) {
                        scheduleAlarm(context, reminder)
                    }
                }
            }
            .addOnFailureListener { /* ignore */ }
    }

    private fun scheduleAlarm(context: Context, reminder: Reminder) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        // Derive a stable request code so reboots don't create duplicate alarms.
        val requestCode = reminder.id.toIntOrNull() ?: reminder.id.hashCode()

        val alarmIntent = Intent(context, ReminderReceiver::class.java).apply {
            putExtra("medicationName", reminder.medicationName)
            putExtra("reminderId", requestCode)
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, requestCode, alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, reminder.scheduledHour)
            set(Calendar.MINUTE, reminder.scheduledMinute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }

        try {
            alarmManager.setRepeating(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                AlarmManager.INTERVAL_DAY,
                pendingIntent
            )
        } catch (e: SecurityException) {
            alarmManager.set(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                pendingIntent
            )
        }
    }
}
