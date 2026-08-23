package com.example.patientapp.data.model

data class Doctor(
    val id: String = "",
    val name: String = "",
    val specialty: String = "",
    val qualification: String = "",
    val experience: String = "",
    val hospital: String = "",
    val available: Boolean = true
)
