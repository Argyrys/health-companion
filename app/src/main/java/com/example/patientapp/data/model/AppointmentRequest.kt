package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class AppointmentRequest(
    val id: String = "",
    val patientId: String = "",
    val patientName: String = "",
    val doctorId: String = "",
    val doctorName: String = "",
    val message: String = "",
    val reportUrl: String = "",
    val status: String = "pending",
    val scheduledTime: Timestamp? = null,
    val rejectionReason: String = "",
    val forwardedBy: String = "",
    val forwardedAt: Timestamp? = null,
    val createdAt: Timestamp? = null
)
