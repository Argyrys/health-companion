package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class Reminder(
    val id: String = "",
    val patientId: String = "",
    val medicationName: String = "",
    val scheduledHour: Int = 8,
    val scheduledMinute: Int = 0,
    val isActive: Boolean = true,
    val taken: Boolean = false,
    val skipped: Boolean = false,
    val date: String = "",
    val createdAt: Timestamp? = null
)
