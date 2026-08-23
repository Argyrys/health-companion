package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class Report(
    val id: String = "",
    val patientId: String = "",
    val pdfUrl: String = "",
    val diagnosis: String = "",
    val prescription: String = "",
    val createdAt: Timestamp? = null
)
