package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class CaseTaking(
    val id: String = "",
    val patientId: String = "",
    val chiefComplaint: String = "",
    val symptoms: List<String> = emptyList(),
    val severity: Int = 5,
    val durationValue: Int = 1,
    val durationUnit: String = "Days",
    val voiceRecordingUrl: String = "",
    val createdAt: Timestamp? = null
)
