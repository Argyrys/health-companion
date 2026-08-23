package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class MedicalHistory(
    val id: String = "",
    val patientId: String = "",
    val diabetes: Boolean = false,
    val hypertension: Boolean = false,
    val asthma: Boolean = false,
    val heartDisease: Boolean = false,
    val previousSurgery: Boolean = false,
    val hospitalization: Boolean = false,
    val otherConditions: List<String> = emptyList(),
    val updatedAt: Timestamp? = null
)
