package com.example.patientapp.ui.reminder

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.ColorRes
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.R
import com.example.patientapp.data.model.Reminder
import com.example.patientapp.databinding.ItemReminderBinding

class ReminderAdapter(
    private val reminders: List<Reminder>,
    private val onTaken: (Reminder) -> Unit,
    private val onSkip: (Reminder) -> Unit,
    private val onEdit: (Reminder) -> Unit,
    private val onDelete: (Reminder) -> Unit
) : RecyclerView.Adapter<ReminderAdapter.ReminderViewHolder>() {

    inner class ReminderViewHolder(private val binding: ItemReminderBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(reminder: Reminder) {
            binding.tvMedName.text = reminder.medicationName
            binding.tvTime.text = String.format("Time: %02d:%02d", reminder.scheduledHour, reminder.scheduledMinute)

            when {
                reminder.taken -> {
                    binding.tvStatus.text = "Taken"
                    setStatus(binding, R.color.success_green)
                    binding.btnTaken.visibility = View.GONE
                    binding.btnSkip.visibility = View.GONE
                }
                reminder.skipped -> {
                    binding.tvStatus.text = "Skipped"
                    setStatus(binding, R.color.warning_orange)
                    binding.btnTaken.visibility = View.GONE
                    binding.btnSkip.visibility = View.GONE
                }
                reminder.isActive -> {
                    binding.tvStatus.text = "Pending"
                    setStatus(binding, R.color.info_blue)
                    binding.btnTaken.visibility = View.VISIBLE
                    binding.btnSkip.visibility = View.VISIBLE
                }
            }

            binding.btnTaken.setOnClickListener { onTaken(reminder) }
            binding.btnSkip.setOnClickListener { onSkip(reminder) }
            binding.btnEdit.setOnClickListener { onEdit(reminder) }
            binding.btnDelete.setOnClickListener { onDelete(reminder) }
        }
    }

    private fun setStatus(binding: ItemReminderBinding, @ColorRes colorRes: Int) {
        val color = ContextCompat.getColor(binding.root.context, colorRes)
        binding.tvStatus.setTextColor(
            ContextCompat.getColor(binding.root.context, R.color.on_primary)
        )
        binding.tvStatus.backgroundTintList = ColorStateList.valueOf(color)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReminderViewHolder {
        val binding = ItemReminderBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ReminderViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ReminderViewHolder, position: Int) {
        holder.bind(reminders[position])
    }

    override fun getItemCount() = reminders.size
}
