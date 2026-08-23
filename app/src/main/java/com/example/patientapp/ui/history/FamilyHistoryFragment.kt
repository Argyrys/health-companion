package com.example.patientapp.ui.history

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.fragment.app.Fragment
import com.example.patientapp.R
import com.example.patientapp.data.model.FamilyHistory
import com.example.patientapp.data.model.FamilyHistoryEntry
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentFamilyHistoryBinding
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class FamilyHistoryFragment : Fragment() {

    private var _binding: FragmentFamilyHistoryBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    private data class EntryViews(val condition: TextInputEditText, val relationship: TextInputEditText)
    private val entryViewsList = mutableListOf<EntryViews>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentFamilyHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        loadExistingData()

        binding.btnAddEntry.setOnClickListener { addEntryField() }
        binding.btnSave.setOnClickListener { saveFamilyHistory() }
    }

    private fun loadExistingData() {
        val uid = sessionManager.getUid() ?: return
        CoroutineScope(Dispatchers.IO).launch {
            patientRepository.observeFamilyHistory(uid).collectLatest { history ->
                history?.let {
                    launch(Dispatchers.Main) {
                        it.entries.forEach { entry ->
                            addEntryField(entry.condition, entry.relationship)
                        }
                    }
                }
            }
        }
    }

    private fun addEntryField(condition: String = "", relationship: String = "") {
        val container = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(0, 8, 0, 8)
        }

        val tilCondition = TextInputLayout(requireContext()).apply {
            hint = getString(R.string.condition_hint)
            boxStrokeColor = resources.getColor(R.color.primary, null)
        }
        val etCondition = TextInputEditText(requireContext()).apply { setText(condition) }
        tilCondition.addView(etCondition)

        val tilRelationship = TextInputLayout(requireContext()).apply {
            hint = getString(R.string.relationship_hint)
            boxStrokeColor = resources.getColor(R.color.primary, null)
        }
        val etRelationship = TextInputEditText(requireContext()).apply { setText(relationship) }
        tilRelationship.addView(etRelationship)

        container.addView(tilCondition)
        container.addView(tilRelationship)

        binding.llEntries.addView(container)
        entryViewsList.add(EntryViews(etCondition, etRelationship))
    }

    private fun saveFamilyHistory() {
        val uid = sessionManager.getUid() ?: return

        val entries = entryViewsList.map {
            FamilyHistoryEntry(
                condition = it.condition.text.toString().trim(),
                relationship = it.relationship.text.toString().trim()
            )
        }.filter { it.condition.isNotEmpty() }

        val history = FamilyHistory(patientId = uid, entries = entries)

        binding.progressBar.visibility = View.VISIBLE
        binding.btnSave.isEnabled = false

        CoroutineScope(Dispatchers.IO).launch {
            val result = patientRepository.saveFamilyHistory(history)
            launch(Dispatchers.Main) {
                binding.progressBar.visibility = View.GONE
                binding.btnSave.isEnabled = true
                if (result.isSuccess) requireContext().showToast("Family history saved")
                else requireContext().showToast(result.toString())
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
