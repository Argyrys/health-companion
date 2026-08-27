package com.example.patientapp.ui.medicinereport

import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.R
import com.example.patientapp.data.model.MedicationAdherence
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MedicineReportFragment : Fragment() {

    private val viewModel: MedicineReportViewModel by viewModels()
    private val statAdapter = MedicineStatAdapter()
    private val logAdapter = AdherenceLogAdapter()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        return inflater.inflate(R.layout.fragment_medicine_report, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<RecyclerView>(R.id.rvMedicineStats).apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = statAdapter
        }
        view.findViewById<RecyclerView>(R.id.rvAdherenceLog).apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = logAdapter
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    updateUI(view, state)
                }
            }
        }
    }

    private fun updateUI(view: View, state: MedicineReportUiState) {
        val adherence = state.adherence

        if (adherence.isEmpty()) {
            view.findViewById<LinearLayout>(R.id.emptyState).visibility = View.VISIBLE
            view.findViewById<TextView>(R.id.tvOverallPercentage).text = "0%"
            view.findViewById<ProgressBar>(R.id.progressOverall).progress = 0
            view.findViewById<TextView>(R.id.tvTakenCount).text = "0"
            view.findViewById<TextView>(R.id.tvMissedCount).text = "0"
            view.findViewById<TextView>(R.id.tvStreakCount).text = "0"
            statAdapter.submitList(emptyList())
            logAdapter.submitList(emptyList())
            return
        }

        view.findViewById<LinearLayout>(R.id.emptyState).visibility = View.GONE

        val taken = adherence.count { it.taken }
        val missed = adherence.count { !it.taken }
        val total = adherence.size
        val pct = if (total > 0) (taken * 100 / total) else 0

        view.findViewById<TextView>(R.id.tvOverallPercentage).text = "$pct%"
        view.findViewById<ProgressBar>(R.id.progressOverall).progress = pct
        view.findViewById<TextView>(R.id.tvTakenCount).text = taken.toString()
        view.findViewById<TextView>(R.id.tvMissedCount).text = missed.toString()
        view.findViewById<TextView>(R.id.tvStreakCount).text = state.streak.toString()

        val color = when {
            pct >= 80 -> 0xFF4CAF50.toInt()
            pct >= 50 -> 0xFFFF9800.toInt()
            else -> 0xFFF44336.toInt()
        }
        view.findViewById<TextView>(R.id.tvOverallPercentage).setTextColor(color)

        statAdapter.submitList(state.stats)
        logAdapter.submitList(adherence.sortedByDescending { it.timestamp?.toDate()?.time ?: 0 }.take(20))
    }
}
