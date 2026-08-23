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
import com.example.patientapp.data.repository.MockDataProvider
import com.example.patientapp.databinding.FragmentDoctorsBinding
import com.example.patientapp.utils.hide
import com.example.patientapp.utils.show
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class DoctorsFragment : Fragment() {

    private var _binding: FragmentDoctorsBinding? = null
    private val binding get() = _binding!!
    private lateinit var adapter: DoctorAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDoctorsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val doctors = MockDataProvider.getMockDoctors()
        adapter = DoctorAdapter(doctors) { doctor ->
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

        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                adapter.filter(s.toString())
                if (adapter.isEmpty()) binding.tvEmpty.show() else binding.tvEmpty.hide()
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
