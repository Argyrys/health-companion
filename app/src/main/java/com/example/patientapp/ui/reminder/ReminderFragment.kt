package com.example.patientapp.ui.reminder

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.patientapp.R
import com.example.patientapp.data.model.Medication
import com.example.patientapp.data.model.Reminder
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentReminderBinding
import com.example.patientapp.utils.ReminderReceiver
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.timepicker.MaterialTimePicker
import com.google.android.material.timepicker.TimeFormat
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.UUID
import javax.inject.Inject

@AndroidEntryPoint
class ReminderFragment : Fragment() {

    private var _binding: FragmentReminderBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    private val reminders = mutableListOf<Reminder>()
    private lateinit var adapter: ReminderAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentReminderBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = ReminderAdapter(reminders,
            onTaken = { markReminder(it, taken = true) },
            onSkip = { markReminder(it, taken = false) }
        )
        binding.rvReminders.layoutManager = LinearLayoutManager(requireContext())
        binding.rvReminders.adapter = adapter

        binding.btnAdd.setOnClickListener { showAddReminderDialog() }

        loadReminders()
    }

    private fun loadReminders() {
        val uid = sessionManager.getUid() ?: return
        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            patientRepository.observeReminders(uid).collectLatest { list ->
                launch(Dispatchers.Main) {
                    reminders.clear()
                    reminders.addAll(list)
                    adapter.notifyDataSetChanged()
                    if (list.isEmpty()) {
                        binding.tvEmpty.visibility = View.VISIBLE
                        binding.rvReminders.visibility = View.GONE
                    } else {
                        binding.tvEmpty.visibility = View.GONE
                        binding.rvReminders.visibility = View.VISIBLE
                    }
                }
            }
        }
    }

    private fun showAddReminderDialog() {
        val uid = sessionManager.getUid() ?: return

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            val meds = patientRepository.observeMedications(uid).first()
            launch(Dispatchers.Main) {
                if (meds.isEmpty()) {
                    requireContext().showToast("No medications added. Add medications first.")
                    return@launch
                }

                val names = meds.map { it.drugName }.toTypedArray()
                MaterialAlertDialogBuilder(requireContext())
                    .setTitle("Select Medication")
                    .setItems(names) { _, which ->
                        showTimePicker(meds[which])
                    }
                    .show()
            }
        }
    }

    private fun showTimePicker(medication: Medication) {
        val picker = MaterialTimePicker.Builder()
            .setTimeFormat(TimeFormat.CLOCK_24H)
            .setHour(8)
            .setMinute(0)
            .setTitleText("Set reminder time")
            .build()

        picker.addOnPositiveButtonClickListener {
            val hour = picker.hour
            val minute = picker.minute
            createReminder(medication, hour, minute)
        }

        picker.show(childFragmentManager, "time_picker")
    }

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { /* permission state handled by receiver/notification */ }

    private fun ensureNotificationPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val granted = ContextCompat.checkSelfPermission(
            requireContext(), Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED
        if (!granted) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private fun ensureIgnoreBatteryOptimizations() {
        val pm = requireContext().getSystemService(Context.POWER_SERVICE) as PowerManager
        if (pm.isIgnoringBatteryOptimizations(requireContext().packageName)) return
        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
            data = Uri.parse("package:${requireContext().packageName}")
        }
        try {
            startActivity(intent)
        } catch (_: Exception) {
            // Fallback: open general battery optimization settings
            try {
                startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
            } catch (_: Exception) {
                // ignore
            }
        }
    }

    private fun createReminder(medication: Medication, hour: Int, minute: Int) {
        ensureNotificationPermission()
        ensureIgnoreBatteryOptimizations()
        val uid = sessionManager.getUid() ?: return
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(System.currentTimeMillis())
        val reminderId = System.currentTimeMillis().toInt()

        val reminder = Reminder(
            id = reminderId.toString(),
            patientId = uid,
            medicationName = medication.drugName,
            scheduledHour = hour,
            scheduledMinute = minute,
            isActive = true,
            date = today
        )

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            val result = patientRepository.saveReminder(reminder)
            launch(Dispatchers.Main) {
                if (result.isSuccess) {
                    scheduleAlarm(reminder, reminderId)
                    requireContext().showToast("Reminder set for ${String.format("%02d:%02d", hour, minute)}")
                } else {
                    requireContext().showToast("Failed to set reminder")
                }
            }
        }
    }

    private fun scheduleAlarm(reminder: Reminder, reminderId: Int) {
        val alarmManager = requireContext().getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(requireContext(), ReminderReceiver::class.java).apply {
            putExtra("medicationName", reminder.medicationName)
            putExtra("reminderId", reminderId)
        }
        val pendingIntent = PendingIntent.getBroadcast(
            requireContext(), reminderId, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, reminder.scheduledHour)
            set(Calendar.MINUTE, reminder.scheduledMinute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }

        try {
            // Use an exact alarm that can still fire while the device is dozing so
            // Samsung battery optimization cannot defer the reminder's delivery.
            alarmManager.setRepeating(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                AlarmManager.INTERVAL_DAY,
                pendingIntent
            )
        } catch (e: SecurityException) {
            // Fallback for devices that don't allow exact alarms
            alarmManager.set(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                pendingIntent
            )
        }
    }

    private fun markReminder(reminder: Reminder, taken: Boolean) {
        val uid = sessionManager.getUid() ?: return
        val updated = reminder.copy(taken = taken, skipped = !taken, isActive = false)

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            patientRepository.updateReminder(updated)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
