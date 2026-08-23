package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class EyeScreening(
    val id: String = "",
    val patientId: String = "",
    val imageUrl: String = "",
    val riskLevel: String = "Pending",
    val aiAssessment: String = "",
    val createdAt: Timestamp? = null
)
