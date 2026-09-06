package com.example.patientapp.ui.appointments

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.R
import com.example.patientapp.databinding.ItemAppointmentBinding
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class AppointmentItem(
    val id: String = "",
    val doctorName: String = "",
    val message: String = "",
    val status: String = "pending",
    val createdAt: Long = 0L,
    val scheduledTime: Long = 0L,
    val rejectionReason: String = "",
    val forwardedBy: String = ""
)

class AppointmentAdapter :
    ListAdapter<AppointmentItem, AppointmentAdapter.ViewHolder>(DIFF) {

    inner class ViewHolder(private val binding: ItemAppointmentBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: AppointmentItem) {
            binding.tvDoctorName.text = item.doctorName
            binding.tvMessage.text = item.message

            val statusText = when (item.status.lowercase()) {
                "forwarded" -> "Scheduled"
                "accepted" -> "Accepted"
                "rejected" -> "Rejected"
                else -> "Pending"
            }
            binding.tvStatus.text = statusText

            val (bgRes, textColor) = when (item.status.lowercase()) {
                "forwarded" -> Pair(R.drawable.bg_status_forwarded, Color.parseColor("#1565C0"))
                "accepted" -> Pair(R.drawable.bg_status_accepted, Color.parseColor("#1B5E20"))
                "rejected" -> Pair(R.drawable.bg_status_rejected, Color.parseColor("#B71C1C"))
                else -> Pair(R.drawable.bg_status_pending, Color.parseColor("#E65100"))
            }
            binding.tvStatus.setBackgroundResource(bgRes)
            binding.tvStatus.setTextColor(textColor)

            val date = Date(item.createdAt)
            val fmt = SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault())
            binding.tvDate.text = "Requested: ${fmt.format(date)}"

            if (item.scheduledTime > 0) {
                val schedFmt = SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault())
                binding.tvScheduledTime.text = "Scheduled: ${schedFmt.format(Date(item.scheduledTime))}"
                binding.tvScheduledTime.visibility = View.VISIBLE
            } else {
                binding.tvScheduledTime.visibility = View.GONE
            }

            if (item.rejectionReason.isNotEmpty()) {
                binding.tvRejectionReason.text = "Reason: ${item.rejectionReason}"
                binding.tvRejectionReason.visibility = View.VISIBLE
            } else {
                binding.tvRejectionReason.visibility = View.GONE
            }

            if (item.forwardedBy.isNotEmpty() && item.status.lowercase() == "forwarded") {
                binding.tvForwardedBy.text = "Forwarded by: ${item.forwardedBy}"
                binding.tvForwardedBy.visibility = View.VISIBLE
            } else {
                binding.tvForwardedBy.visibility = View.GONE
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemAppointmentBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<AppointmentItem>() {
            override fun areItemsTheSame(a: AppointmentItem, b: AppointmentItem) = a.id == b.id
            override fun areContentsTheSame(a: AppointmentItem, b: AppointmentItem) = a == b
        }
    }
}
