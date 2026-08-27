package com.example.patientapp.ui.medicinereport

data class MedicineStat(
    val name: String,
    val taken: Int,
    val missed: Int,
    val percentage: Int
)
