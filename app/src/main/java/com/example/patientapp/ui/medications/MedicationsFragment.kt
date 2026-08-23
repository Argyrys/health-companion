package com.example.patientapp.ui.medications

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.patientapp.R
import com.example.patientapp.data.model.Medication
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentMedicationsBinding
import com.example.patientapp.utils.Constants
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.hide
import com.example.patientapp.utils.show
import com.example.patientapp.utils.showToast
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@AndroidEntryPoint
class MedicationsFragment : Fragment() {

    private var _binding: FragmentMedicationsBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    private val medications = mutableListOf<Medication>()
    private lateinit var adapter: MedicationAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMedicationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = MedicationAdapter(medications,
            onEdit = { showAddEditDialog(it) },
            onDelete = { deleteMedication(it) }
        )
        binding.rvMedications.layoutManager = LinearLayoutManager(requireContext())
        binding.rvMedications.adapter = adapter

        binding.btnAdd.setOnClickListener { showAddEditDialog(null) }

        loadMedications()
    }

    private fun loadMedications() {
        val uid = sessionManager.getUid() ?: return
        CoroutineScope(Dispatchers.IO).launch {
            patientRepository.observeMedications(uid).collectLatest { meds ->
                launch(Dispatchers.Main) {
                    medications.clear()
                    medications.addAll(meds)
                    adapter.notifyDataSetChanged()
                    if (meds.isEmpty()) {
                        binding.tvEmpty.show()
                        binding.rvMedications.hide()
                    } else {
                        binding.tvEmpty.hide()
                        binding.rvMedications.show()
                    }
                }
            }
        }
    }

    private fun showAddEditDialog(existing: Medication?) {
        val dialogView = LayoutInflater.from(requireContext())
            .inflate(R.layout.dialog_add_medication, null)

        val tilDrug = dialogView.findViewById<TextInputLayout>(R.id.tilDrugName)
        val etDrug = dialogView.findViewById<TextInputEditText>(R.id.etDrugName)
        val tilDosage = dialogView.findViewById<TextInputLayout>(R.id.tilDosage)
        val etDosage = dialogView.findViewById<TextInputEditText>(R.id.etDosage)
        val btnFrequency = dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnFrequency)

        var selectedFrequency = existing?.frequency ?: Constants.FREQUENCIES[0]

        existing?.let {
            etDrug.setText(it.drugName)
            etDosage.setText(it.dosage)
            btnFrequency.text = it.frequency
        }

        btnFrequency.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Select Frequency")
                .setItems(Constants.FREQUENCIES.toTypedArray()) { _, which ->
                    selectedFrequency = Constants.FREQUENCIES[which]
                    btnFrequency.text = selectedFrequency
                }
                .show()
        }

        MaterialAlertDialogBuilder(requireContext())
            .setTitle(if (existing != null) "Edit Medication" else "Add Medication")
            .setView(dialogView)
            .setPositiveButton("Save") { _, _ ->
                val drugName = etDrug.text.toString().trim()
                val dosage = etDosage.text.toString().trim()
                if (drugName.isEmpty() || dosage.isEmpty()) {
                    requireContext().showToast("Please fill all fields")
                    return@setPositiveButton
                }
                val med = Medication(
                    id = existing?.id ?: UUID.randomUUID().toString(),
                    patientId = sessionManager.getUid() ?: "",
                    drugName = drugName,
                    dosage = dosage,
                    frequency = selectedFrequency
                )
                saveMedication(med)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun saveMedication(med: Medication) {
        val uid = sessionManager.getUid() ?: return
        val updated = medications.toMutableList()
        val index = updated.indexOfFirst { it.id == med.id }
        if (index >= 0) updated[index] = med else updated.add(med)

        CoroutineScope(Dispatchers.IO).launch {
            val result = patientRepository.saveMedications(updated, uid)
            launch(Dispatchers.Main) {
                if (result.isSuccess) requireContext().showToast("Medication saved")
                else requireContext().showToast(result.toString())
            }
        }
    }

    private fun deleteMedication(med: Medication) {
        val uid = sessionManager.getUid() ?: return
        val updated = medications.toMutableList()
        updated.removeAll { it.id == med.id }

        CoroutineScope(Dispatchers.IO).launch {
            val result = patientRepository.saveMedications(updated, uid)
            launch(Dispatchers.Main) {
                if (result.isSuccess) requireContext().showToast("Medication removed")
                else requireContext().showToast(result.toString())
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
