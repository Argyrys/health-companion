package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class MedicationAdherence(
    val id: String = "",
    val patientId: String = "",
    val medicationName: String = "",
    val taken: Boolean = false,
    val timestamp: Timestamp? = null
)
