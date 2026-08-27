package com.example.patientapp.utils

object Constants {
    const val PREFS_NAME = "patient_prefs"
    const val KEY_UID = "uid"
    const val KEY_PHONE = "phone"
    const val KEY_REGISTERED = "registered"

    // Firestore collections
    const val COLLECTION_PATIENTS = "patients"
    const val SUBCOLLECTION_PROFILE = "profile"
    const val SUBCOLLECTION_CASE_TAKING = "caseTaking"
    const val SUBCOLLECTION_MEDICAL_HISTORY = "medicalHistory"
    const val SUBCOLLECTION_FAMILY_HISTORY = "familyHistory"
    const val SUBCOLLECTION_MEDICATIONS = "medications"
    const val SUBCOLLECTION_ALLERGIES = "allergies"
    const val SUBCOLLECTION_EYE_SCREENING = "eyeScreening"
    const val SUBCOLLECTION_MENTAL_HEALTH = "mentalHealth"
    const val SUBCOLLECTION_REPORTS = "reports"
    const val SUBCOLLECTION_REMINDERS = "reminders"

    // Storage paths
    const val STORAGE_VOICE = "voice"
    const val STORAGE_EYE_IMAGES = "eye-images"
    const val STORAGE_REPORTS = "reports"

    // Symptom list
    val SYMPTOMS = listOf(
        "Fever", "Headache", "Cough", "Cold", "Fatigue",
        "Nausea", "Vomiting", "Dizziness", "Pain", "Other"
    )

    // Blood groups
    val BLOOD_GROUPS = listOf("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")

    // Genders
    val GENDERS = listOf("Male", "Female", "Other")

    // Frequencies
    val FREQUENCIES = listOf(
        "Once daily", "Twice daily", "Three times daily",
        "Once weekly", "As needed"
    )

    // Duration units
    val DURATION_UNITS = listOf("Hours", "Days", "Weeks", "Months")

    // Allergy types
    val ALLERGY_TYPES = listOf("Drug", "Food", "Environmental")

    // Allergy severity
    val ALLERGY_SEVERITIES = listOf("Mild", "Moderate", "Severe")

    // Mental health answer options
    val MENTAL_HEALTH_OPTIONS = listOf(
        "Never", "Rarely", "Sometimes", "Often", "Always"
    )

    // 12 Mental health questions covering mood, stress, anxiety, sleep, energy, concentration, wellbeing, daily functioning
    val MENTAL_HEALTH_QUESTIONS = listOf(
        // Mood (1-2)
        "How often do you feel happy and content with your life?",
        "How often do you feel sad, down, or hopeless?",
        // Stress (3-4)
        "How often do you feel overwhelmed or unable to cope with daily tasks?",
        "How often do you feel that stress is negatively affecting your physical health?",
        // Anxiety (5-6)
        "How often do you feel nervous, anxious, or on edge?",
        "How often do you have difficulty controlling worry?",
        // Sleep (7-8)
        "How often do you have trouble falling asleep or staying asleep?",
        "How often do you feel rested after a night's sleep?",
        // Energy (9-10)
        "How often do you feel tired or have little energy?",
        "How often do you feel motivated to accomplish your daily tasks?",
        // Concentration & Daily Functioning (11-12)
        "How often do you have difficulty concentrating or making decisions?",
        "How often do your emotional concerns interfere with your work, relationships, or daily activities?"
    )

    // Categories for analysis
    val MENTAL_HEALTH_CATEGORIES = listOf(
        "Mood", "Mood",
        "Stress", "Stress",
        "Anxiety", "Anxiety",
        "Sleep", "Sleep",
        "Energy", "Energy",
        "Concentration & Functioning", "Concentration & Functioning"
    )

    // Reverse scored questions (higher answer = better for these)
    val REVERSE_SCORED_INDICES = setOf(0, 7, 9)
}
