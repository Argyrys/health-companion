package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class FamilyHistoryEntry(
    val id: String = "",
    val condition: String = "",
    val relationship: String = ""
)

data class FamilyHistory(
    val id: String = "",
    val patientId: String = "",
    val entries: List<FamilyHistoryEntry> = emptyList(),
    val updatedAt: Timestamp? = null
)
