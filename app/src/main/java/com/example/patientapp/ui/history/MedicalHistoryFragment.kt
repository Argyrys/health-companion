package com.example.patientapp.ui.history

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.patientapp.R
import com.example.patientapp.data.model.MedicalHistory
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentMedicalHistoryBinding
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class MedicalHistoryFragment : Fragment() {

    private var _binding: FragmentMedicalHistoryBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    private val otherConditionViews = mutableListOf<TextInputEditText>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMedicalHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        loadExistingData()

        binding.btnAddCondition.setOnClickListener { addConditionField() }

        binding.btnSave.setOnClickListener { saveMedicalHistory() }
    }

    private fun loadExistingData() {
        val uid = sessionManager.getUid() ?: return
        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            val history = patientRepository.observeMedicalHistory(uid).first()
            history?.let {
                launch(Dispatchers.Main) {
                    binding.cbDiabetes.isChecked = it.diabetes
                    binding.cbHypertension.isChecked = it.hypertension
                    binding.cbAsthma.isChecked = it.asthma
                    binding.cbHeartDisease.isChecked = it.heartDisease
                    binding.cbPreviousSurgery.isChecked = it.previousSurgery
                    binding.cbHospitalization.isChecked = it.hospitalization
                    otherConditionViews.clear()
                    binding.llOtherConditions.removeAllViews()
                    it.otherConditions.forEach { condition -> addConditionField(condition) }
                }
            }
        }
    }

    private fun addConditionField(value: String = "") {
        val til = TextInputLayout(requireContext()).apply {
            hint = "Condition"
            boxStrokeColor = resources.getColor(R.color.primary, null)
            setPadding(0, 8, 0, 0)
        }
        val et = TextInputEditText(requireContext()).apply {
            setText(value)
        }
        til.addView(et)
        binding.llOtherConditions.addView(til)
        otherConditionViews.add(et)
    }

    private fun saveMedicalHistory() {
        val uid = sessionManager.getUid() ?: return

        val otherConditions = otherConditionViews.mapNotNull { it.text.toString().trim().ifEmpty { null } }

        val history = MedicalHistory(
            patientId = uid,
            diabetes = binding.cbDiabetes.isChecked,
            hypertension = binding.cbHypertension.isChecked,
            asthma = binding.cbAsthma.isChecked,
            heartDisease = binding.cbHeartDisease.isChecked,
            previousSurgery = binding.cbPreviousSurgery.isChecked,
            hospitalization = binding.cbHospitalization.isChecked,
            otherConditions = otherConditions
        )

        binding.progressBar.visibility = View.VISIBLE
        binding.btnSave.isEnabled = false

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            val result = patientRepository.saveMedicalHistory(history)
            launch(Dispatchers.Main) {
                binding.progressBar.visibility = View.GONE
                binding.btnSave.isEnabled = true
                if (result.isSuccess) requireContext().showToast("Medical history saved")
                else requireContext().showToast(result.toString())
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
