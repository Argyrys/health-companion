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
        patientDoc(uid).collection("data").document("reportData").collection("reports")

    private fun remindersCol(uid: String) =
        patientDoc(uid).collection("data").document("reminderData").collection("reminders")

    private fun voiceDoc(uid: String) =
        patientDoc(uid).collection("data").document("voiceTranscription")

    // ==================== PROFILE ====================
    suspend fun saveProfile(patient: Patient): Resource<Unit> {
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
            Resource.Error(e.message ?: "Failed to save profile to cloud")
        }
    }

    fun observeProfile(uid: String): Flow<Patient?> {
        return callbackFlow {
            val local = localAuthManager.getPatientProfile(uid)
            if (local != null) trySend(local)

            try {
                val reg = profileDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        if (local == null) trySend(null)
                        return@addSnapshotListener
                    }
                    val patient = snapshot?.toObject(Patient::class.java)
                    if (patient != null) {
                        localAuthManager.savePatientProfile(uid, patient)
                    }
                    trySend(patient ?: local)
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(local)
            }
        }
    }

    suspend fun getProfile(uid: String): Patient? {
        return try {
            profileDoc(uid).get().await().toObject(Patient::class.java)
                ?: localAuthManager.getPatientProfile(uid)
        } catch (e: Exception) {
            localAuthManager.getPatientProfile(uid)
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
            Resource.Error(e.message ?: "Failed to save case taking to cloud")
        }
    }

    fun observeCaseTaking(uid: String): Flow<CaseTaking?> {
        return callbackFlow {
            val local = localAuthManager.getCaseTaking(uid)
            if (local != null) trySend(local)

            try {
                val reg = caseDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { if (local == null) trySend(null); return@addSnapshotListener }
                    val data = snapshot?.toObject(CaseTaking::class.java)
                    trySend(data ?: local)
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(local)
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
            Resource.Error(e.message ?: "Failed to save medical history to cloud")
        }
    }

    fun observeMedicalHistory(uid: String): Flow<MedicalHistory?> {
        return callbackFlow {
            val local = localAuthManager.getMedicalHistory(uid)
            if (local != null) trySend(local)

            try {
                val reg = medHistoryDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { if (local == null) trySend(null); return@addSnapshotListener }
                    val data = snapshot?.toObject(MedicalHistory::class.java)
                    trySend(data ?: local)
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(local)
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
            Resource.Error(e.message ?: "Failed to save family history to cloud")
        }
    }

    fun observeFamilyHistory(uid: String): Flow<FamilyHistory?> {
        return callbackFlow {
            val local = localAuthManager.getFamilyHistory(uid)
            if (local != null) trySend(local)

            try {
                val reg = famHistoryDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { if (local == null) trySend(null); return@addSnapshotListener }
                    val data = snapshot?.toObject(FamilyHistory::class.java)
                    trySend(data ?: local)
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(local)
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
            Resource.Error(e.message ?: "Failed to save medications to cloud")
        }
    }

    fun observeMedications(uid: String): Flow<List<Medication>> {
        return callbackFlow {
            val local = localAuthManager.getMedications(uid)
            if (local.isNotEmpty()) trySend(local)

            try {
                val reg = medicationsDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { if (local.isEmpty()) trySend(emptyList()); return@addSnapshotListener }
                    val list = snapshot?.get("medications") as? List<Map<String, Any>> ?: emptyList()
                    val meds = list.map {
                        Medication(
                            id = it["id"] as? String ?: "",
                            patientId = it["patientId"] as? String ?: uid,
                            drugName = it["drugName"] as? String ?: "",
                            dosage = it["dosage"] as? String ?: "",
                            frequency = it["frequency"] as? String ?: "Once daily"
                        )
                    }
                    trySend(meds.ifEmpty { local })
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(local)
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
            Resource.Error(e.message ?: "Failed to save allergies to cloud")
        }
    }

    fun observeAllergies(uid: String): Flow<List<Allergy>> {
        return callbackFlow {
            val local = localAuthManager.getAllergies(uid)
            if (local.isNotEmpty()) trySend(local)

            try {
                val reg = allergiesDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { if (local.isEmpty()) trySend(emptyList()); return@addSnapshotListener }
                    val list = snapshot?.get("allergies") as? List<Map<String, Any>> ?: emptyList()
                    val allergies = list.map {
                        Allergy(
                            id = it["id"] as? String ?: "",
                            patientId = it["patientId"] as? String ?: uid,
                            allergyType = it["allergyType"] as? String ?: "",
                            allergen = it["allergen"] as? String ?: "",
                            severity = it["severity"] as? String ?: "Mild"
                        )
                    }
                    trySend(allergies.ifEmpty { local })
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(local)
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
            Resource.Error(e.message ?: "Failed to save eye screening to cloud")
        }
    }

    fun observeEyeScreening(uid: String): Flow<EyeScreening?> {
        return callbackFlow {
            val local = localAuthManager.getEyeScreening(uid)
            if (local != null) trySend(local)

            try {
                val reg = eyeScreeningDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { if (local == null) trySend(null); return@addSnapshotListener }
                    val data = snapshot?.toObject(EyeScreening::class.java)
                    trySend(data ?: local)
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(local)
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
            Resource.Error(e.message ?: "Failed to save mental health to cloud")
        }
    }

    fun observeMentalHealth(uid: String): Flow<MentalHealth?> {
        return callbackFlow {
            val local = localAuthManager.getMentalHealth(uid)
            if (local != null) trySend(local)

            try {
                val reg = mentalHealthDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { if (local == null) trySend(null); return@addSnapshotListener }
                    val data = snapshot?.toObject(MentalHealth::class.java)
                    trySend(data ?: local)
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(local)
            }
        }
    }

    // ==================== REPORTS ====================
    suspend fun saveReport(report: Report): Resource<Unit> {
        return try {
            reportsCol(report.patientId).add(report).await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Failed to save report to cloud")
        }
    }

    fun observeReports(uid: String): Flow<List<Report>> {
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
            Resource.Error(e.message ?: "Failed to save reminder to cloud")
        }
    }

    suspend fun updateReminder(reminder: Reminder): Resource<Unit> {
        return try {
            val snapshot = remindersCol(reminder.patientId)
                .whereEqualTo("id", reminder.id).get().await()
            snapshot.documents.firstOrNull()?.reference?.set(reminder, SetOptions.merge())?.await()
            Resource.Success(Unit)
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Failed to update reminder")
        }
    }

    fun observeReminders(uid: String): Flow<List<Reminder>> {
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
        try {
            voiceDoc(uid).set(
                mapOf("text" to text, "updatedAt" to Timestamp.now()),
                SetOptions.merge()
            ).await()
        } catch (_: Exception) { }
    }

    fun getVoiceTranscription(uid: String): String? {
        return localAuthManager.getVoiceTranscription(uid)
    }

    fun observeVoiceTranscription(uid: String): Flow<String?> {
        return callbackFlow {
            val local = localAuthManager.getVoiceTranscription(uid)
            if (local != null) trySend(local)

            try {
                val reg = voiceDoc(uid).addSnapshotListener { snapshot, error ->
                    if (error != null) { if (local == null) trySend(null); return@addSnapshotListener }
                    val text = snapshot?.getString("text")
                    trySend(text ?: local)
                }
                awaitClose { reg.remove() }
            } catch (e: Exception) {
                trySend(local)
            }
        }
    }
}
