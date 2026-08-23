package com.example.patientapp.data.repository

import com.example.patientapp.data.model.*

object MockDataProvider {

    // No demo patient data - fresh start

    fun getMockDoctors() = listOf(
        Doctor("doc1", "Dr. Priya Mehta", "General Physician", "MBBS, MD", "12 years", "City Hospital"),
        Doctor("doc2", "Dr. Arjun Singh", "Cardiologist", "MBBS, DM Cardiology", "15 years", "Heart Care Center"),
        Doctor("doc3", "Dr. Neha Gupta", "Dermatologist", "MBBS, MD Dermatology", "8 years", "Skin & Wellness Clinic"),
        Doctor("doc4", "Dr. Rajesh Kumar", "Orthopedic Surgeon", "MS Orthopedics", "20 years", "Bone & Joint Hospital"),
        Doctor("doc5", "Dr. Ananya Patel", "Psychiatrist", "MBBS, MD Psychiatry", "10 years", "Mind Care Hospital"),
        Doctor("doc6", "Dr. Sanjay Verma", "ENT Specialist", "MBBS, MS ENT", "14 years", "ENT & Allergy Center"),
        Doctor("doc7", "Dr. Kavita Reddy", "Ophthalmologist", "MBBS, MS Ophthalmology", "11 years", "Eye Care Hospital"),
        Doctor("doc8", "Dr. Mohan Das", "Pediatrician", "MBBS, MD Pediatrics", "18 years", "Child Health Clinic"),
        Doctor("doc9", "Dr. Sunita Joshi", "Gynecologist", "MBBS, MS OB-GYN", "16 years", "Women's Health Center"),
        Doctor("doc10", "Dr. Amit Sharma", "Neurologist", "MBBS, DM Neurology", "13 years", "Neuro Care Hospital")
    )
}
