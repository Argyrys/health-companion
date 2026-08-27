package com.example.patientapp.ui.allergies

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.patientapp.R
import com.example.patientapp.data.model.Allergy
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentAllergiesBinding
import com.example.patientapp.utils.Constants
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.hide
import com.example.patientapp.utils.show
import com.example.patientapp.utils.showToast
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@AndroidEntryPoint
class AllergiesFragment : Fragment() {

    private var _binding: FragmentAllergiesBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    private val allergies = mutableListOf<Allergy>()
    private lateinit var adapter: AllergyAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAllergiesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = AllergyAdapter(allergies) { deleteAllergy(it) }
        binding.rvAllergies.layoutManager = LinearLayoutManager(requireContext())
        binding.rvAllergies.adapter = adapter

        binding.btnAdd.setOnClickListener { showAddDialog() }

        loadAllergies()
    }

    private fun loadAllergies() {
        val uid = sessionManager.getUid() ?: return
        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            patientRepository.observeAllergies(uid).collectLatest { list ->
                launch(Dispatchers.Main) {
                    allergies.clear()
                    allergies.addAll(list)
                    adapter.notifyDataSetChanged()
                    if (list.isEmpty()) {
                        binding.tvEmpty.show()
                        binding.rvAllergies.hide()
                    } else {
                        binding.tvEmpty.hide()
                        binding.rvAllergies.show()
                    }
                }
            }
        }
    }

    private fun showAddDialog() {
        val dialogView = LayoutInflater.from(requireContext())
            .inflate(R.layout.dialog_add_allergy, null)

        val btnType = dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnAllergyType)
        val etAllergen = dialogView.findViewById<TextInputEditText>(R.id.etAllergen)
        val btnSeverity = dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnAllergySeverity)

        var selectedType = Constants.ALLERGY_TYPES[0]
        var selectedSeverity = Constants.ALLERGY_SEVERITIES[0]
        btnType.text = selectedType
        btnSeverity.text = selectedSeverity

        btnType.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Allergy Type")
                .setItems(Constants.ALLERGY_TYPES.toTypedArray()) { _, w ->
                    selectedType = Constants.ALLERGY_TYPES[w]
                    btnType.text = selectedType
                }
                .show()
        }

        btnSeverity.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Severity")
                .setItems(Constants.ALLERGY_SEVERITIES.toTypedArray()) { _, w ->
                    selectedSeverity = Constants.ALLERGY_SEVERITIES[w]
                    btnSeverity.text = selectedSeverity
                }
                .show()
        }

        val dialog = MaterialAlertDialogBuilder(requireContext())
            .setTitle("Add Allergy")
            .setView(dialogView)
            .setPositiveButton("Add", null)
            .setNegativeButton("Cancel", null)
            .create()

        dialog.setOnShowListener {
            dialog.getButton(android.app.Dialog.BUTTON_POSITIVE).setOnClickListener {
                val allergen = etAllergen.text.toString().trim()
                if (allergen.isEmpty()) {
                    requireContext().showToast("Please enter allergen name")
                    return@setOnClickListener
                }
                val allergy = Allergy(
                    id = UUID.randomUUID().toString(),
                    patientId = sessionManager.getUid() ?: "",
                    allergyType = selectedType,
                    allergen = allergen,
                    severity = selectedSeverity
                )
                saveAllergy(allergy)
                dialog.dismiss()
            }
        }
        dialog.show()
    }

    private fun saveAllergy(allergy: Allergy) {
        val uid = sessionManager.getUid() ?: return
        val updated = allergies.toMutableList()
        updated.add(allergy)

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            val result = patientRepository.saveAllergies(updated, uid)
            launch(Dispatchers.Main) {
                if (result.isSuccess) requireContext().showToast("Allergy added")
                else requireContext().showToast(result.toString())
            }
        }
    }

    private fun deleteAllergy(allergy: Allergy) {
        val uid = sessionManager.getUid() ?: return
        val updated = allergies.toMutableList()
        updated.removeAll { it.id == allergy.id }

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            val result = patientRepository.saveAllergies(updated, uid)
            launch(Dispatchers.Main) {
                if (result.isSuccess) requireContext().showToast("Allergy removed")
                else requireContext().showToast(result.toString())
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
