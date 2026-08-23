package com.example.patientapp.ui.medications

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.data.model.Medication
import com.example.patientapp.databinding.ItemMedicationBinding

class MedicationAdapter(
    private val medications: MutableList<Medication>,
    private val onEdit: (Medication) -> Unit,
    private val onDelete: (Medication) -> Unit
) : RecyclerView.Adapter<MedicationAdapter.MedViewHolder>() {

    inner class MedViewHolder(private val binding: ItemMedicationBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(med: Medication) {
            binding.tvDrugName.text = med.drugName
            binding.tvDosage.text = "Dosage: ${med.dosage}"
            binding.tvFrequency.text = med.frequency
            binding.btnEdit.setOnClickListener { onEdit(med) }
            binding.btnDelete.setOnClickListener { onDelete(med) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MedViewHolder {
        val binding = ItemMedicationBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return MedViewHolder(binding)
    }

    override fun onBindViewHolder(holder: MedViewHolder, position: Int) {
        holder.bind(medications[position])
    }

    override fun getItemCount() = medications.size

    fun updateList(newList: List<Medication>) {
        medications.clear()
        medications.addAll(newList)
        notifyDataSetChanged()
    }
}
