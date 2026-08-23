package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class Medication(
    val id: String = "",
    val patientId: String = "",
    val drugName: String = "",
    val dosage: String = "",
    val frequency: String = "Once daily",
    val updatedAt: Timestamp? = null
)
