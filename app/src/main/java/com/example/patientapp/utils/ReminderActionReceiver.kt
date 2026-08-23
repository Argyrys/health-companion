package com.example.patientapp.utils

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.firebase.firestore.FirebaseFirestore

class ReminderActionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val reminderId = intent.getIntExtra("reminderId", 0)
        val status = intent.getStringExtra("status") ?: return

        // Update reminder in Firestore
        val firestore = FirebaseFirestore.getInstance()
        val uid = SessionManager(context).getUid() ?: return

        firestore.collection("patients")
            .document(uid)
            .collection("data")
            .document("reminderData")
            .collection("reminders")
            .whereEqualTo("id", reminderId.toString())
            .get()
            .addOnSuccessListener { documents ->
                for (document in documents) {
                    val updates = when (status) {
                        "taken" -> mapOf("taken" to true, "skipped" to false, "isActive" to false)
                        "skipped" -> mapOf("taken" to false, "skipped" to true, "isActive" to false)
                        else -> emptyMap()
                    }
                    if (updates.isNotEmpty()) {
                        document.reference.update(updates)
                    }
                }
            }
    }
}
