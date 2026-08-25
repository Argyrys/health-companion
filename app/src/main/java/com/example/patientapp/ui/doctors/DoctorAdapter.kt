package com.example.patientapp.ui.doctors

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.data.model.Doctor
import com.example.patientapp.databinding.ItemDoctorBinding

class DoctorAdapter(
    initialDoctors: List<Doctor>,
    private val onClick: (Doctor) -> Unit
) : RecyclerView.Adapter<DoctorAdapter.DoctorViewHolder>() {

    private val allDoctors = initialDoctors.toMutableList()
    private var filteredDoctors = allDoctors.toMutableList()

    fun updateDoctors(newDoctors: List<Doctor>) {
        allDoctors.clear()
        allDoctors.addAll(newDoctors)
        filteredDoctors = allDoctors.toMutableList()
        notifyDataSetChanged()
    }

    inner class DoctorViewHolder(private val binding: ItemDoctorBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(doctor: Doctor) {
            binding.tvDoctorName.text = doctor.name
            binding.tvSpecialty.text = doctor.specialty
            binding.tvHospital.text = "${doctor.hospital} \u2022 ${doctor.experience}"
            binding.root.setOnClickListener { onClick(doctor) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DoctorViewHolder {
        val binding = ItemDoctorBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return DoctorViewHolder(binding)
    }

    override fun onBindViewHolder(holder: DoctorViewHolder, position: Int) {
        holder.bind(filteredDoctors[position])
    }

    override fun getItemCount() = filteredDoctors.size

    fun filter(query: String) {
        filteredDoctors = if (query.isEmpty()) {
            allDoctors.toMutableList()
        } else {
            allDoctors.filter {
                it.name.contains(query, ignoreCase = true) ||
                it.specialty.contains(query, ignoreCase = true) ||
                it.hospital.contains(query, ignoreCase = true)
            }.toMutableList()
        }
        notifyDataSetChanged()
    }

    fun isEmpty() = filteredDoctors.isEmpty()
}
