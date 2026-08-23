package com.example.patientapp.ui.report

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.data.model.Report
import com.example.patientapp.databinding.ItemReportBinding
import com.example.patientapp.utils.toFormattedDate

class ReportAdapter(
    private val reports: List<Report>,
    private val onShare: (Report) -> Unit
) : RecyclerView.Adapter<ReportAdapter.ReportViewHolder>() {

    inner class ReportViewHolder(private val binding: ItemReportBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(report: Report) {
            binding.tvReportTitle.text = "Patient Report"
            binding.tvReportDate.text = report.createdAt?.toDate()?.time?.toFormattedDate() ?: "Unknown date"
            binding.btnShare.setOnClickListener { onShare(report) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReportViewHolder {
        val binding = ItemReportBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ReportViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ReportViewHolder, position: Int) {
        holder.bind(reports[position])
    }

    override fun getItemCount() = reports.size
}
