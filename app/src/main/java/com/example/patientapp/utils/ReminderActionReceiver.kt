package com.example.patientapp.utils

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.example.patientapp.data.model.MedicationAdherence
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore

class ReminderActionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val reminderId = intent.getIntExtra("reminderId", 0)
        val status = intent.getStringExtra("status") ?: return
        val medicationName = intent.getStringExtra("medicationName") ?: "medicine"

        val firestore = FirebaseFirestore.getInstance()
        val uid = SessionManager(context).getUid() ?: return

        // Save adherence record
        val adherence = hashMapOf(
            "patientId" to uid,
            "medicationName" to medicationName,
            "taken" to (status == "taken"),
            "timestamp" to Timestamp.now()
        )
        firestore.collection("patients")
            .document(uid)
            .collection("data")
            .document("medicationAdherenceData")
            .collection("adherence")
            .add(adherence)

        // Update reminder status
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
