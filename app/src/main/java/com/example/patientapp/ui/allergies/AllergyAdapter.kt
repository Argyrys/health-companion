package com.example.patientapp.ui.allergies

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.R
import com.example.patientapp.data.model.Allergy
import com.example.patientapp.databinding.ItemAllergyBinding

class AllergyAdapter(
    private val allergies: MutableList<Allergy>,
    private val onDelete: (Allergy) -> Unit
) : RecyclerView.Adapter<AllergyAdapter.AllergyViewHolder>() {

    inner class AllergyViewHolder(private val binding: ItemAllergyBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(allergy: Allergy) {
            binding.tvAllergen.text = allergy.allergen
            binding.tvType.text = "Type: ${allergy.allergyType}"
            binding.tvSeverity.text = "Severity: ${allergy.severity}"
            binding.tvSeverity.setTextColor(
                when (allergy.severity) {
                    "Severe" -> ContextCompat.getColor(binding.root.context, R.color.danger_red)
                    "Moderate" -> ContextCompat.getColor(binding.root.context, R.color.warning_orange)
                    else -> ContextCompat.getColor(binding.root.context, R.color.success_green)
                }
            )
            binding.btnDelete.setOnClickListener { onDelete(allergy) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AllergyViewHolder {
        val binding = ItemAllergyBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return AllergyViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AllergyViewHolder, position: Int) {
        holder.bind(allergies[position])
    }

    override fun getItemCount() = allergies.size

    fun updateList(newList: List<Allergy>) {
        allergies.clear()
        allergies.addAll(newList)
        notifyDataSetChanged()
    }
}
