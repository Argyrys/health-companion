package com.example.patientapp.ui.medicinereport

import android.graphics.drawable.GradientDrawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.R

class MedicineStatAdapter : ListAdapter<MedicineStat, MedicineStatAdapter.ViewHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_medicine_stat, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val tvName: TextView = view.findViewById(R.id.tvMedName)
        private val tvPercentage: TextView = view.findViewById(R.id.tvMedPercentage)
        private val progress: ProgressBar = view.findViewById(R.id.progressMed)
        private val tvTaken: TextView = view.findViewById(R.id.tvMedTaken)
        private val tvMissed: TextView = view.findViewById(R.id.tvMedMissed)

        fun bind(stat: MedicineStat) {
            tvName.text = stat.name
            tvPercentage.text = "${stat.percentage}%"
            progress.progress = stat.percentage
            tvTaken.text = "${stat.taken} taken"
            tvMissed.text = "${stat.missed} missed"

            val color = when {
                stat.percentage >= 80 -> 0xFF4CAF50.toInt()
                stat.percentage >= 50 -> 0xFFFF9800.toInt()
                else -> 0xFFF44336.toInt()
            }
            tvPercentage.setTextColor(color)
            val bg = tvPercentage.background as? GradientDrawable
            bg?.setColor(ContextCompat.getColor(itemView.context, R.color.background))
        }
    }

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<MedicineStat>() {
            override fun areItemsTheSame(a: MedicineStat, b: MedicineStat) = a.name == b.name
            override fun areContentsTheSame(a: MedicineStat, b: MedicineStat) = a == b
        }
    }
}
