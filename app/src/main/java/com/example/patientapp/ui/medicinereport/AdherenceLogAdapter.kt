package com.example.patientapp.ui.medicinereport

import android.graphics.drawable.GradientDrawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.R
import com.example.patientapp.data.model.MedicationAdherence
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AdherenceLogAdapter : ListAdapter<MedicationAdherence, AdherenceLogAdapter.ViewHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_adherence_log, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val dot: View = view.findViewById(R.id.statusDot)
        private val tvName: TextView = view.findViewById(R.id.tvLogMedName)
        private val tvTime: TextView = view.findViewById(R.id.tvLogTime)
        private val tvStatus: TextView = view.findViewById(R.id.tvLogStatus)

        private val dateFmt = SimpleDateFormat("MMM d, h:mm a", Locale.getDefault())

        fun bind(item: MedicationAdherence) {
            tvName.text = item.medicationName
            val ts = item.timestamp?.toDate()
            tvTime.text = if (ts != null) dateFmt.format(ts) else ""

            if (item.taken) {
                tvStatus.text = "Taken"
                tvStatus.setTextColor(0xFF4CAF50.toInt())
                val d = GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setColor(0xFF4CAF50.toInt())
                    setSize(20, 20)
                }
                dot.background = d
            } else {
                tvStatus.text = "Missed"
                tvStatus.setTextColor(0xFFF44336.toInt())
                val d = GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setColor(0xFFF44336.toInt())
                    setSize(20, 20)
                }
                dot.background = d
            }
        }
    }

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<MedicationAdherence>() {
            override fun areItemsTheSame(a: MedicationAdherence, b: MedicationAdherence) = a.id == b.id
            override fun areContentsTheSame(a: MedicationAdherence, b: MedicationAdherence) = a == b
        }
    }
}
