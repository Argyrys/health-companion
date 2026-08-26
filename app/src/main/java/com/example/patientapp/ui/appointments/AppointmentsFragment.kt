package com.example.patientapp.ui.appointments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.patientapp.databinding.FragmentAppointmentsBinding
import com.example.patientapp.utils.SessionManager
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class AppointmentsFragment : Fragment() {

    private var _binding: FragmentAppointmentsBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager

    private lateinit var adapter: AppointmentAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAppointmentsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = AppointmentAdapter()
        binding.rvAppointments.layoutManager = LinearLayoutManager(requireContext())
        binding.rvAppointments.adapter = adapter

        binding.btnBack.setOnClickListener {
            findNavController().popBackStack()
        }

        loadAppointments()
    }

    private fun loadAppointments() {
        val uid = sessionManager.getUid()
        if (uid.isNullOrEmpty()) {
            showEmpty()
            return
        }

        showLoading()

        FirebaseFirestore.getInstance()
            .collection("appointments")
            .whereEqualTo("patientId", uid)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (!isAdded) return@addSnapshotListener

                if (error != null || snapshot == null) {
                    showEmpty()
                    return@addSnapshotListener
                }

                val items = snapshot.documents.mapNotNull { doc ->
                    AppointmentItem(
                        id = doc.id,
                        doctorName = doc.getString("doctorName") ?: "Unknown Doctor",
                        message = doc.getString("message") ?: "",
                        status = doc.getString("status") ?: "pending",
                        createdAt = doc.getLong("createdAt") ?: 0L
                    )
                }

                if (items.isEmpty()) {
                    showEmpty()
                } else {
                    showList()
                    adapter.submitList(items)
                }
            }
    }

    private fun showLoading() {
        binding.progressBar.visibility = View.VISIBLE
        binding.emptyState.visibility = View.GONE
        binding.rvAppointments.visibility = View.GONE
    }

    private fun showEmpty() {
        binding.progressBar.visibility = View.GONE
        binding.emptyState.visibility = View.VISIBLE
        binding.rvAppointments.visibility = View.GONE
    }

    private fun showList() {
        binding.progressBar.visibility = View.GONE
        binding.emptyState.visibility = View.GONE
        binding.rvAppointments.visibility = View.VISIBLE
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
