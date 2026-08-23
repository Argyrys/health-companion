package com.example.patientapp.data.repository

import com.example.patientapp.data.model.*
import com.example.patientapp.utils.Constants
import com.example.patientapp.utils.LocalAuthManager
import com.example.patientapp.utils.Resource
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PatientRepository @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val localAuthManager: LocalAuthManager
) {
    private val useLocal: Boolean by lazy {
        try {
            firestore.app
            false
        } catch (e: Exception) {
            true
        }
    }

    private fun patientDoc(uid: String) =
        firestore.collection(Constants.COLLECTION_PATIENTS).document(uid)

    private fun profileDoc(uid: String) =
        patientDoc(uid).collection("data").document(Constants.SUBCOLLECTION_PROFILE)

    private fun caseDoc(uid: String) =
        patientDoc(uid).collection("data").document(Constants.SUBCOLLECTION_CASE_TAKING)

    private fun medHistoryDoc(uid: String) =
        patientDoc(uid).collection("data").document(Constants.SUBCOLLECTION_MEDICAL_HISTORY)

    private fun famHistoryDoc(uid: String) =
        patientDoc(uid).collection("data").document(Constants.SUBCOLLECTION_FAMILY_HISTORY)

    private fun medicationsDoc(uid: String) =
        patientDoc(uid).collection("data").document(Constants.SUBCOLLECTION_MEDICATIONS)

    private fun allergiesDoc(uid: String) =
        patientDoc(uid).collection("data").document(Constants.SUBCOLLECTION_ALLERGIES)

    private fun eyeScreeningDoc(uid: String) =
        patientDoc(uid).collection("data").document(Constants.SUBCOLLECTION_EYE_SCREENING)

    private fun mentalHealthDoc(uid: String) =
        patientDoc(uid).collection("data").document(Constants.SUBCOLLECTION_MENTAL_HEALTH)

    private fun reportsCol(uid: String) =
        patientDoc(uid).collection("data").document("reportData")
            .collection("reports")

    private fun remindersCol(uid: String) =
        patientDoc(uid).collection("data").document("reminderData")
            .collection("reminders")

    // ==================== PROFILE ====================
    suspend fun saveProfile(patient: Patient): Resource<Unit> {
        // Always save locally
        localAuthManager.savePatientProfile(patient.uid, patient)

        return try {
            val data = mapOf(
                "uid" to patient.uid,
                "fullName" to patient.fullName,
                "age" to patient.age,
                "gender" to patient.gender,
                "phoneNumber" to patient.phoneNumber,
                "email" to patient.email,
                "bloodGroup" to patient.bloodGroup,
                "height" to patient.height,
                "weight" to patient.weight,
                "address" to patient.address,
                "city" to patient.city,
                "emergencyContactName" to patient.emergencyContactName,
                "emergencyContactNumber" to patient.emergencyContactNumber,
                "existingConditions" to patient.existingConditions,
                "preferredLanguage" to patient.preferredLanguage,
                "updatedAt" to Timestamp.now()
            )
            profileDoc(patient.uid).set(data, SetOptions.merge()).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit) // Local save succeeded
        }
    }

    fun observeProfile(uid: String): Flow<Patient?> {
        // Always try local first
        val localPatient = localAuthManager.getPatientProfile(uid)
        if (localPatient != null) {
            return flowOf(localPatient)
        }
        if (useLocal) return flowOf(null)
        return callbackFlow {
            try {
                val reg = profileDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        trySend(null)
                        return@addSnapshotListener
                    }
                    val patient = snapshot?.toObject(Patient::class.java)
                    trySend(patient)
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(null)
            }
        }
    }

    suspend fun getProfile(uid: String): Patient? {
        val local = localAuthManager.getPatientProfile(uid)
        if (local != null) return local

        return try {
            profileDoc(uid).get().await().toObject(Patient::class.java)
        } catch (e: Exception) {
            null
        }
    }

    // ==================== CASE TAKING ====================
    suspend fun saveCaseTaking(caseTaking: CaseTaking): Resource<Unit> {
        localAuthManager.saveCaseTaking(caseTaking.patientId, caseTaking)
        return try {
            val data = mapOf(
                "id" to caseTaking.patientId,
                "patientId" to caseTaking.patientId,
                "chiefComplaint" to caseTaking.chiefComplaint,
                "symptoms" to caseTaking.symptoms,
                "severity" to caseTaking.severity,
                "durationValue" to caseTaking.durationValue,
                "durationUnit" to caseTaking.durationUnit,
                "voiceRecordingUrl" to caseTaking.voiceRecordingUrl,
                "createdAt" to Timestamp.now()
            )
            caseDoc(caseTaking.patientId).set(data, SetOptions.merge()).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    fun observeCaseTaking(uid: String): Flow<CaseTaking?> {
        val local = localAuthManager.getCaseTaking(uid)
        if (local != null) return flowOf(local)
        if (useLocal) return flowOf(null)
        return callbackFlow {
            try {
                val reg = caseDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { trySend(null); return@addSnapshotListener }
                    trySend(snapshot?.toObject(CaseTaking::class.java))
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(null)
            }
        }
    }

    // ==================== MEDICAL HISTORY ====================
    suspend fun saveMedicalHistory(history: MedicalHistory): Resource<Unit> {
        localAuthManager.saveMedicalHistory(history.patientId, history)
        return try {
            val data = mapOf(
                "id" to history.patientId,
                "patientId" to history.patientId,
                "diabetes" to history.diabetes,
                "hypertension" to history.hypertension,
                "asthma" to history.asthma,
                "heartDisease" to history.heartDisease,
                "previousSurgery" to history.previousSurgery,
                "hospitalization" to history.hospitalization,
                "otherConditions" to history.otherConditions,
                "updatedAt" to Timestamp.now()
            )
            medHistoryDoc(history.patientId).set(data, SetOptions.merge()).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    fun observeMedicalHistory(uid: String): Flow<MedicalHistory?> {
        val local = localAuthManager.getMedicalHistory(uid)
        if (local != null) return flowOf(local)
        if (useLocal) return flowOf(null)
        return callbackFlow {
            try {
                val reg = medHistoryDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { trySend(null); return@addSnapshotListener }
                    trySend(snapshot?.toObject(MedicalHistory::class.java))
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(null)
            }
        }
    }

    // ==================== FAMILY HISTORY ====================
    suspend fun saveFamilyHistory(history: FamilyHistory): Resource<Unit> {
        localAuthManager.saveFamilyHistory(history.patientId, history)
        return try {
            val data = mapOf(
                "id" to history.patientId,
                "patientId" to history.patientId,
                "entries" to history.entries.map { mapOf("id" to it.id, "condition" to it.condition, "relationship" to it.relationship) },
                "updatedAt" to Timestamp.now()
            )
            famHistoryDoc(history.patientId).set(data, SetOptions.merge()).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    fun observeFamilyHistory(uid: String): Flow<FamilyHistory?> {
        val local = localAuthManager.getFamilyHistory(uid)
        if (local != null) return flowOf(local)
        if (useLocal) return flowOf(null)
        return callbackFlow {
            try {
                val reg = famHistoryDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { trySend(null); return@addSnapshotListener }
                    trySend(snapshot?.toObject(FamilyHistory::class.java))
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(null)
            }
        }
    }

    // ==================== MEDICATIONS ====================
    suspend fun saveMedications(medications: List<Medication>, patientId: String): Resource<Unit> {
        localAuthManager.saveMedications(patientId, medications)
        return try {
            val data = mapOf(
                "patientId" to patientId,
                "medications" to medications.map {
                    mapOf("id" to it.id, "drugName" to it.drugName, "dosage" to it.dosage, "frequency" to it.frequency)
                },
                "updatedAt" to Timestamp.now()
            )
            medicationsDoc(patientId).set(data, SetOptions.merge()).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    fun observeMedications(uid: String): Flow<List<Medication>> {
        val local = localAuthManager.getMedications(uid)
        if (local.isNotEmpty()) return flowOf(local)
        if (useLocal) return flowOf(emptyList())
        return callbackFlow {
            try {
                val reg = medicationsDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { trySend(emptyList()); return@addSnapshotListener }
                    val list = snapshot?.get("medications") as? List<Map<String, Any>> ?: emptyList()
                    trySend(list.map {
                        Medication(
                            id = it["id"] as? String ?: "",
                            patientId = it["patientId"] as? String ?: uid,
                            drugName = it["drugName"] as? String ?: "",
                            dosage = it["dosage"] as? String ?: "",
                            frequency = it["frequency"] as? String ?: "Once daily"
                        )
                    })
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(emptyList())
            }
        }
    }

    // ==================== ALLERGIES ====================
    suspend fun saveAllergies(allergies: List<Allergy>, patientId: String): Resource<Unit> {
        localAuthManager.saveAllergies(patientId, allergies)
        return try {
            val data = mapOf(
                "patientId" to patientId,
                "allergies" to allergies.map {
                    mapOf("id" to it.id, "allergyType" to it.allergyType, "allergen" to it.allergen, "severity" to it.severity)
                },
                "updatedAt" to Timestamp.now()
            )
            allergiesDoc(patientId).set(data, SetOptions.merge()).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    fun observeAllergies(uid: String): Flow<List<Allergy>> {
        val local = localAuthManager.getAllergies(uid)
        if (local.isNotEmpty()) return flowOf(local)
        if (useLocal) return flowOf(emptyList())
        return callbackFlow {
            try {
                val reg = allergiesDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { trySend(emptyList()); return@addSnapshotListener }
                    val list = snapshot?.get("allergies") as? List<Map<String, Any>> ?: emptyList()
                    trySend(list.map {
                        Allergy(
                            id = it["id"] as? String ?: "",
                            patientId = it["patientId"] as? String ?: uid,
                            allergyType = it["allergyType"] as? String ?: "",
                            allergen = it["allergen"] as? String ?: "",
                            severity = it["severity"] as? String ?: "Mild"
                        )
                    })
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(emptyList())
            }
        }
    }

    // ==================== EYE SCREENING ====================
    suspend fun saveEyeScreening(screening: EyeScreening): Resource<Unit> {
        localAuthManager.saveEyeScreening(screening.patientId, screening)
        return try {
            eyeScreeningDoc(screening.patientId).set(screening, SetOptions.merge()).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    fun observeEyeScreening(uid: String): Flow<EyeScreening?> {
        val local = localAuthManager.getEyeScreening(uid)
        if (local != null) return flowOf(local)
        if (useLocal) return flowOf(null)
        return callbackFlow {
            try {
                val reg = eyeScreeningDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { trySend(null); return@addSnapshotListener }
                    trySend(snapshot?.toObject(EyeScreening::class.java))
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(null)
            }
        }
    }

    // ==================== MENTAL HEALTH ====================
    suspend fun saveMentalHealth(mentalHealth: MentalHealth): Resource<Unit> {
        localAuthManager.saveMentalHealth(mentalHealth.patientId, mentalHealth)
        return try {
            mentalHealthDoc(mentalHealth.patientId).set(mentalHealth, SetOptions.merge()).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    fun observeMentalHealth(uid: String): Flow<MentalHealth?> {
        val local = localAuthManager.getMentalHealth(uid)
        if (local != null) return flowOf(local)
        if (useLocal) return flowOf(null)
        return callbackFlow {
            try {
                val reg = mentalHealthDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { trySend(null); return@addSnapshotListener }
                    trySend(snapshot?.toObject(MentalHealth::class.java))
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(null)
            }
        }
    }

    // ==================== REPORTS ====================
    suspend fun saveReport(report: Report): Resource<Unit> {
        return try {
            reportsCol(report.patientId).add(report).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    fun observeReports(uid: String): Flow<List<Report>> {
        if (useLocal) return flowOf(emptyList())
        return callbackFlow {
            try {
                val reg = reportsCol(uid).orderBy("createdAt")
                    .addSnapshotListener { snapshot, error ->
                        if (error != null) { trySend(emptyList()); return@addSnapshotListener }
                        trySend(snapshot?.documents?.mapNotNull { it.toObject(Report::class.java) } ?: emptyList())
                    }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(emptyList())
            }
        }
    }

    // ==================== REMINDERS ====================
    suspend fun saveReminder(reminder: Reminder): Resource<Unit> {
        return try {
            remindersCol(reminder.patientId).add(reminder).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    suspend fun updateReminder(reminder: Reminder): Resource<Unit> {
        return try {
            val snapshot = remindersCol(reminder.patientId)
                .whereEqualTo("id", reminder.id).get().await()
            snapshot.documents.firstOrNull()?.reference?.set(reminder, SetOptions.merge())?.await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Success(Unit)
        }
    }

    fun observeReminders(uid: String): Flow<List<Reminder>> {
        if (useLocal) return flowOf(emptyList())
        return callbackFlow {
            try {
                val reg = remindersCol(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { trySend(emptyList()); return@addSnapshotListener }
                    trySend(snapshot?.documents?.mapNotNull { it.toObject(Reminder::class.java) } ?: emptyList())
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(emptyList())
            }
        }
    }

    // ==================== VOICE TRANSCRIPTION ====================
    suspend fun saveVoiceTranscription(uid: String, text: String) {
        localAuthManager.saveVoiceTranscription(uid, text)
    }

    fun getVoiceTranscription(uid: String): String? {
        return localAuthManager.getVoiceTranscription(uid)
    }
}
