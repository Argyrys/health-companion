package com.example.patientapp.ui.history

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentHistoryBinding
import com.example.patientapp.utils.SessionManager
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class HistoryFragment : Fragment() {

    private var _binding: FragmentHistoryBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        loadHistory()
    }

    private fun loadHistory() {
        val uid = sessionManager.getUid() ?: return

        CoroutineScope(Dispatchers.IO).launch {
            patientRepository.observeCaseTaking(uid).collectLatest { case ->
                case?.let {
                    launch(Dispatchers.Main) {
                        val symptoms = if (it.symptoms.isNotEmpty()) it.symptoms.joinToString(", ") else "None"
                        binding.tvChiefComplaint.text = "Complaint: ${it.chiefComplaint}\nSymptoms: $symptoms\nSeverity: ${it.severity}/10\nDuration: ${it.durationValue} ${it.durationUnit}"
                    }
                }
            }
        }

        CoroutineScope(Dispatchers.IO).launch {
            patientRepository.observeMedicalHistory(uid).collectLatest { history ->
                history?.let {
                    launch(Dispatchers.Main) {
                        val conditions = mutableListOf<String>()
                        if (it.diabetes) conditions.add("Diabetes")
                        if (it.hypertension) conditions.add("Hypertension")
                        if (it.asthma) conditions.add("Asthma")
                        if (it.heartDisease) conditions.add("Heart Disease")
                        if (it.previousSurgery) conditions.add("Previous Surgery")
                        if (it.hospitalization) conditions.add("Hospitalization")
                        conditions.addAll(it.otherConditions)
                        binding.tvMedHistory.text = if (conditions.isNotEmpty()) conditions.joinToString("\n• ", "• ") else "No conditions recorded"
                    }
                }
            }
        }

        CoroutineScope(Dispatchers.IO).launch {
            patientRepository.observeFamilyHistory(uid).collectLatest { family ->
                family?.let {
                    launch(Dispatchers.Main) {
                        if (it.entries.isNotEmpty()) {
                            binding.tvFamilyHistory.text = it.entries.joinToString("\n") { e ->
                                "${e.condition} - ${e.relationship}"
                            }
                        }
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
