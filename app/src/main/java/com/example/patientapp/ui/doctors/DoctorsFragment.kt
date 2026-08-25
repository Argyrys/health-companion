package com.example.patientapp.ui.doctors

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.patientapp.R
import com.example.patientapp.data.model.Doctor
import com.example.patientapp.databinding.FragmentDoctorsBinding
import com.example.patientapp.utils.hide
import com.example.patientapp.utils.show
import com.google.firebase.firestore.FirebaseFirestore
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class DoctorsFragment : Fragment() {

    private var _binding: FragmentDoctorsBinding? = null
    private val binding get() = _binding!!
    private lateinit var adapter: DoctorAdapter

    @Inject lateinit var firestore: FirebaseFirestore

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDoctorsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = DoctorAdapter(emptyList()) { doctor ->
            val bundle = bundleOf(
                "doctorId" to doctor.id,
                "doctorName" to doctor.name,
                "specialty" to doctor.specialty,
                "qualification" to doctor.qualification,
                "experience" to doctor.experience,
                "hospital" to doctor.hospital
            )
            findNavController().navigate(R.id.action_doctors_to_doctorDetail, bundle)
        }
        binding.rvDoctors.layoutManager = LinearLayoutManager(requireContext())
        binding.rvDoctors.adapter = adapter

        loadDoctors()

        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                adapter.filter(s.toString())
                if (adapter.isEmpty()) binding.tvEmpty.show() else binding.tvEmpty.hide()
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun loadDoctors() {
        binding.progressBar?.visibility = View.VISIBLE
        binding.tvEmpty.hide()

        firestore.collection("doctors").get()
            .addOnSuccessListener { snapshot ->
                if (!isAdded) return@addOnSuccessListener
                binding.progressBar?.visibility = View.GONE

                val doctors = snapshot.documents.mapNotNull { doc ->
                    val name = doc.getString("name") ?: return@mapNotNull null
                    val specialty = doc.getString("specialty") ?: ""
                    val qualification = doc.getString("qualification") ?: ""
                    val experience = doc.getString("experience") ?: ""
                    val hospital = doc.getString("hospital") ?: ""
                    val available = doc.getBoolean("available") ?: true
                    Doctor(
                        id = doc.id,
                        name = name,
                        specialty = specialty,
                        qualification = qualification,
                        experience = experience,
                        hospital = hospital,
                        available = available
                    )
                }

                adapter.updateDoctors(doctors)
                if (doctors.isEmpty()) binding.tvEmpty.show() else binding.tvEmpty.hide()
            }
            .addOnFailureListener {
                if (!isAdded) return@addOnFailureListener
                binding.progressBar?.visibility = View.GONE
                binding.tvEmpty.show()
            }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
