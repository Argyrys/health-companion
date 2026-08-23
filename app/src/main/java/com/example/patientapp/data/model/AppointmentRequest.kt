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
    val status: String = "Pending",
    val createdAt: Timestamp? = null
)
