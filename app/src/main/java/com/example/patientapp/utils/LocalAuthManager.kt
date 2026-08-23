package com.example.patientapp.utils

import android.content.Context
import android.content.SharedPreferences
import com.example.patientapp.data.model.Patient
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Local-only authentication manager for development/testing.
 * Stores accounts and patient data in SharedPreferences.
 * Do NOT use in production — replace with Firebase/backend auth.
 */
@Singleton
class LocalAuthManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("local_auth_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    companion object {
        private const val KEY_ACCOUNTS = "accounts"
        private const val KEY_CURRENT_SESSION = "current_session_uid"
        private const val KEY_PATIENT_PROFILES = "patient_profiles"
        private const val KEY_CASE_TAKING = "case_taking"
        private const val KEY_MEDICAL_HISTORY = "medical_history"
        private const val KEY_FAMILY_HISTORY = "family_history"
        private const val KEY_MEDICATIONS = "medications"
        private const val KEY_ALLERGIES = "allergies"
        private const val KEY_EYE_SCREENING = "eye_screening"
        private const val KEY_MENTAL_HEALTH = "mental_health"
        private const val KEY_VOICE_TRANSCRIPTION = "voice_transcription"
    }

    // ==================== ACCOUNT MANAGEMENT ====================

    data class LocalAccount(
        val uid: String,
        val name: String,
        val email: String,
        val password: String // In production, never store plain-text passwords
    )

    private fun getAccounts(): MutableMap<String, LocalAccount> {
        val json = prefs.getString(KEY_ACCOUNTS, null) ?: return mutableMapOf()
        val type = object : TypeToken<MutableMap<String, LocalAccount>>() {}.type
        return try {
            gson.fromJson(json, type) ?: mutableMapOf()
        } catch (e: Exception) {
            mutableMapOf()
        }
    }

    private fun saveAccounts(accounts: Map<String, LocalAccount>) {
        prefs.edit().putString(KEY_ACCOUNTS, gson.toJson(accounts)).apply()
    }

    fun emailExists(email: String): Boolean {
        val accounts = getAccounts()
        return accounts.values.any { it.email.equals(email, ignoreCase = true) }
    }

    fun createAccount(name: String, email: String, password: String): Result<String> {
        if (emailExists(email)) {
            return Result.failure(Exception("An account with this email already exists. Please log in."))
        }

        val uid = UUID.randomUUID().toString()
        val account = LocalAccount(uid = uid, name = name, email = email, password = password)

        val accounts = getAccounts()
        accounts[uid] = account
        saveAccounts(accounts)

        // Create initial patient profile
        val patient = Patient(uid = uid, fullName = name, email = email)
        savePatientProfile(uid, patient)

        // Auto-login after registration
        setCurrentSession(uid)

        return Result.success(uid)
    }

    fun login(email: String, password: String): Result<String> {
        val accounts = getAccounts()
        val account = accounts.values.find {
            it.email.equals(email, ignoreCase = true)
        }

        if (account == null) {
            return Result.failure(Exception("No account found with this email."))
        }

        if (account.password != password) {
            return Result.failure(Exception("Incorrect password."))
        }

        setCurrentSession(account.uid)
        return Result.success(account.uid)
    }

    fun logout() {
        prefs.edit().remove(KEY_CURRENT_SESSION).apply()
    }

    fun getCurrentSessionUid(): String? {
        return prefs.getString(KEY_CURRENT_SESSION, null)
    }

    fun isLoggedIn(): Boolean = getCurrentSessionUid() != null

    private fun setCurrentSession(uid: String) {
        prefs.edit().putString(KEY_CURRENT_SESSION, uid).apply()
    }

    fun getAccountByEmail(email: String): LocalAccount? {
        return getAccounts().values.find { it.email.equals(email, ignoreCase = true) }
    }

    // ==================== PATIENT PROFILE ====================

    private fun getProfiles(): MutableMap<String, Patient> {
        val json = prefs.getString(KEY_PATIENT_PROFILES, null) ?: return mutableMapOf()
        val type = object : TypeToken<MutableMap<String, Patient>>() {}.type
        return try {
            gson.fromJson(json, type) ?: mutableMapOf()
        } catch (e: Exception) {
            mutableMapOf()
        }
    }

    private fun saveProfiles(profiles: Map<String, Patient>) {
        prefs.edit().putString(KEY_PATIENT_PROFILES, gson.toJson(profiles)).apply()
    }

    fun getPatientProfile(uid: String): Patient? {
        return getProfiles()[uid]
    }

    fun savePatientProfile(uid: String, patient: Patient) {
        val profiles = getProfiles()
        profiles[uid] = patient
        saveProfiles(profiles)
    }

    // ==================== GENERIC DATA STORE ====================

    private inline fun <reified T> getData(key: String, uid: String): T? {
        val json = prefs.getString("${key}_${uid}", null) ?: return null
        return try {
            gson.fromJson(json, T::class.java)
        } catch (e: Exception) {
            null
        }
    }

    private inline fun <reified T> saveData(key: String, uid: String, data: T) {
        prefs.edit().putString("${key}_${uid}", gson.toJson(data)).apply()
    }

    private inline fun <reified T> getListData(key: String, uid: String): List<T> {
        val json = prefs.getString("${key}_${uid}", null) ?: return emptyList()
        val type = object : TypeToken<List<T>>() {}.type
        return try {
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    private inline fun <reified T> saveListData(key: String, uid: String, data: List<T>) {
        prefs.edit().putString("${key}_${uid}", gson.toJson(data)).apply()
    }

    // ==================== CASE TAKING ====================

    fun getCaseTaking(uid: String): com.example.patientapp.data.model.CaseTaking? {
        return getData(KEY_CASE_TAKING, uid)
    }

    fun saveCaseTaking(uid: String, caseTaking: com.example.patientapp.data.model.CaseTaking) {
        saveData(KEY_CASE_TAKING, uid, caseTaking)
    }

    // ==================== MEDICAL HISTORY ====================

    fun getMedicalHistory(uid: String): com.example.patientapp.data.model.MedicalHistory? {
        return getData(KEY_MEDICAL_HISTORY, uid)
    }

    fun saveMedicalHistory(uid: String, history: com.example.patientapp.data.model.MedicalHistory) {
        saveData(KEY_MEDICAL_HISTORY, uid, history)
    }

    // ==================== FAMILY HISTORY ====================

    fun getFamilyHistory(uid: String): com.example.patientapp.data.model.FamilyHistory? {
        return getData(KEY_FAMILY_HISTORY, uid)
    }

    fun saveFamilyHistory(uid: String, history: com.example.patientapp.data.model.FamilyHistory) {
        saveData(KEY_FAMILY_HISTORY, uid, history)
    }

    // ==================== MEDICATIONS ====================

    fun getMedications(uid: String): List<com.example.patientapp.data.model.Medication> {
        return getListData(KEY_MEDICATIONS, uid)
    }

    fun saveMedications(uid: String, medications: List<com.example.patientapp.data.model.Medication>) {
        saveListData(KEY_MEDICATIONS, uid, medications)
    }

    // ==================== ALLERGIES ====================

    fun getAllergies(uid: String): List<com.example.patientapp.data.model.Allergy> {
        return getListData(KEY_ALLERGIES, uid)
    }

    fun saveAllergies(uid: String, allergies: List<com.example.patientapp.data.model.Allergy>) {
        saveListData(KEY_ALLERGIES, uid, allergies)
    }

    // ==================== EYE SCREENING ====================

    fun getEyeScreening(uid: String): com.example.patientapp.data.model.EyeScreening? {
        return getData(KEY_EYE_SCREENING, uid)
    }

    fun saveEyeScreening(uid: String, screening: com.example.patientapp.data.model.EyeScreening) {
        saveData(KEY_EYE_SCREENING, uid, screening)
    }

    // ==================== MENTAL HEALTH ====================

    fun getMentalHealth(uid: String): com.example.patientapp.data.model.MentalHealth? {
        return getData(KEY_MENTAL_HEALTH, uid)
    }

    fun saveMentalHealth(uid: String, mentalHealth: com.example.patientapp.data.model.MentalHealth) {
        saveData(KEY_MENTAL_HEALTH, uid, mentalHealth)
    }

    // ==================== VOICE TRANSCRIPTION ====================

    fun getVoiceTranscription(uid: String): String? {
        return prefs.getString("${KEY_VOICE_TRANSCRIPTION}_$uid", null)
    }

    fun saveVoiceTranscription(uid: String, text: String) {
        prefs.edit().putString("${KEY_VOICE_TRANSCRIPTION}_$uid", text).apply()
    }

    // ==================== FULL CLEAR ====================

    fun clearSession() {
        prefs.edit().remove(KEY_CURRENT_SESSION).apply()
    }
}
