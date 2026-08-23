package com.example.patientapp.data.model

import com.google.firebase.Timestamp

data class MentalHealthQuestion(
    val question: String = "",
    val answer: Int = 0
)

data class MentalHealth(
    val id: String = "",
    val patientId: String = "",
    val questions: List<MentalHealthQuestion> = emptyList(),
    val score: Int = 0,
    val status: String = "",
    val createdAt: Timestamp? = null
)
