package com.example.patientapp.ui.casetaking

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.SeekBar
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.patientapp.R
import com.example.patientapp.data.model.CaseTaking
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentCaseTakingBinding
import com.example.patientapp.utils.Constants
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.android.material.chip.Chip
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class CaseTakingFragment : Fragment() {

    private var _binding: FragmentCaseTakingBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    private var selectedDurationUnit = "Days"

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCaseTakingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupSymptoms()
        setupSeverity()
        setupDurationUnit()

        binding.btnVoiceRecording.setOnClickListener {
            findNavController().navigate(R.id.action_caseTaking_to_voiceRecording)
        }

        binding.btnSave.setOnClickListener {
            saveCaseTaking()
        }
    }

    private fun setupSymptoms() {
        Constants.SYMPTOMS.forEach { symptom ->
            val chip = Chip(requireContext()).apply {
                text = symptom
                isCheckable = true
                chipBackgroundColor = resources.getColorStateList(R.color.light_gray, null)
            }
            binding.chipGroupSymptoms.addView(chip)
        }
    }

    private fun setupSeverity() {
        binding.seekBarSeverity.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                binding.tvSeverityValue.text = "Severity: $progress/10"
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
    }

    private fun setupDurationUnit() {
        binding.btnDurationUnit.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Select Duration Unit")
                .setItems(Constants.DURATION_UNITS.toTypedArray()) { _, which ->
                    selectedDurationUnit = Constants.DURATION_UNITS[which]
                    binding.btnDurationUnit.text = selectedDurationUnit
                }
                .show()
        }
    }

    private fun saveCaseTaking() {
        val chiefComplaint = binding.etChiefComplaint.text.toString().trim()
        if (chiefComplaint.isEmpty()) {
            binding.tilChiefComplaint.error = "Please describe your concern"
            return
        }

        val selectedSymptoms = mutableListOf<String>()
        for (i in 0 until binding.chipGroupSymptoms.childCount) {
            val chip = binding.chipGroupSymptoms.getChildAt(i) as? Chip
            if (chip?.isChecked == true) {
                selectedSymptoms.add(chip.text.toString())
            }
        }

        val severity = binding.seekBarSeverity.progress
        val durationValue = binding.etDurationValue.text.toString().trim().toIntOrNull() ?: 1

        val uid = sessionManager.getUid() ?: return

        val caseTaking = CaseTaking(
            patientId = uid,
            chiefComplaint = chiefComplaint,
            symptoms = selectedSymptoms,
            severity = severity,
            durationValue = durationValue,
            durationUnit = selectedDurationUnit
        )

        binding.progressBar.visibility = View.VISIBLE
        binding.btnSave.isEnabled = false

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            val result = patientRepository.saveCaseTaking(caseTaking)
            launch(Dispatchers.Main) {
                binding.progressBar.visibility = View.GONE
                binding.btnSave.isEnabled = true
                if (result.isSuccess) {
                    requireContext().showToast("Case saved successfully")
                    findNavController().popBackStack()
                } else {
                    requireContext().showToast(result.toString())
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
