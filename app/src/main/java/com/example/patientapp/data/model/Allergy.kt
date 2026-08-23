package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class Allergy(
    val id: String = "",
    val patientId: String = "",
    val allergyType: String = "",
    val allergen: String = "",
    val severity: String = "Mild",
    val updatedAt: Timestamp? = null
)
