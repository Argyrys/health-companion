package com.example.patientapp.ui.medicinereport

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.patientapp.data.model.MedicationAdherence
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.utils.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Calendar
import javax.inject.Inject

data class MedicineReportUiState(
    val adherence: List<MedicationAdherence> = emptyList(),
    val stats: List<MedicineStat> = emptyList(),
    val streak: Int = 0
)

@HiltViewModel
class MedicineReportViewModel @Inject constructor(
    private val patientRepository: PatientRepository,
    private val sessionManager: SessionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(MedicineReportUiState())
    val uiState: StateFlow<MedicineReportUiState> = _uiState

    init {
        loadAdherence()
    }

    private fun loadAdherence() {
        val uid = sessionManager.getUid() ?: return
        viewModelScope.launch {
            patientRepository.observeAdherence(uid).collect { adherence ->
                val stats = computeStats(adherence)
                val streak = computeStreak(adherence)
                _uiState.update { it.copy(adherence = adherence, stats = stats, streak = streak) }
            }
        }
    }

    private fun computeStats(adherence: List<MedicationAdherence>): List<MedicineStat> {
        return adherence.groupBy { it.medicationName }.map { (name, entries) ->
            val taken = entries.count { it.taken }
            val total = entries.size
            val pct = if (total > 0) (taken * 100 / total) else 0
            MedicineStat(name = name, taken = taken, missed = total - taken, percentage = pct)
        }.sortedByDescending { it.percentage }
    }

    private fun computeStreak(adherence: List<MedicationAdherence>): Int {
        if (adherence.isEmpty()) return 0
        val cal = Calendar.getInstance()
        var streak = 0
        val today = cal.timeInMillis

        for (dayOffset in 0..365) {
            cal.timeInMillis = today
            cal.add(Calendar.DAY_OF_YEAR, -dayOffset)
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val dayStart = cal.timeInMillis

            cal.add(Calendar.DAY_OF_YEAR, 1)
            val dayEnd = cal.timeInMillis

            val dayEntries = adherence.filter { entry ->
                val ts = entry.timestamp?.toDate()?.time ?: return@filter false
                ts in dayStart until dayEnd
            }

            if (dayEntries.isEmpty()) {
                if (dayOffset > 0) break
                continue
            }

            val allTaken = dayEntries.all { it.taken }
            if (allTaken) streak++ else break
        }
        return streak
    }
}
