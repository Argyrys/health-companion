package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class Patient(
    val uid: String = "",
    val fullName: String = "",
    val age: Int = 0,
    val gender: String = "",
    val phoneNumber: String = "",
    val email: String = "",
    val bloodGroup: String = "",
    val height: String = "",
    val weight: String = "",
    val address: String = "",
    val city: String = "",
    val emergencyContactName: String = "",
    val emergencyContactNumber: String = "",
    val existingConditions: String = "",
    val preferredLanguage: String = "",
    val createdAt: Timestamp? = null,
    val updatedAt: Timestamp? = null
)
