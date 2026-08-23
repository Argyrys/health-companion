package com.example.patientapp.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import com.example.patientapp.R
import com.example.patientapp.data.model.Patient
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentHomeBinding
import com.example.patientapp.utils.SessionManager
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.util.Calendar
import javax.inject.Inject

@AndroidEntryPoint
class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    private val features = listOf(
        FeatureItem("\uD83D\uDCDD", "Case Taking", R.id.action_home_to_caseTaking),
        FeatureItem("\uD83D\uDCCB", "Medical History", R.id.action_home_to_medicalHistory),
        FeatureItem("\uD83E\uDDD1\u200D\uD83E\uDDD2\u200D\uD83E\uDDD3\u200D\uD83E\uDDD4", "Family History", R.id.action_home_to_familyHistory),
        FeatureItem("\uD83D\uDC8A", "Medications", R.id.action_home_to_medications),
        FeatureItem("\u26A0\uFE0F", "Allergies", R.id.action_home_to_allergies),
        FeatureItem("\uD83D\uDC41\uFE0F", "Eye Screening", R.id.action_home_to_eyeScreening),
        FeatureItem("\uD83E\uDDE0", "Mental Health", R.id.action_home_to_mentalHealth),
        FeatureItem("\uD83D\uDCCA", "My Reports", R.id.action_home_to_reports),
        FeatureItem("\u23F0", "Reminders", R.id.action_home_to_reminders)
    )

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Set dynamic greeting
        setGreeting()

        val adapter = FeatureAdapter(features) { feature ->
            findNavController().navigate(feature.actionId)
        }
        binding.rvFeatures.layoutManager = GridLayoutManager(requireContext(), 3)
        binding.rvFeatures.adapter = adapter

        binding.btnSignIn.setOnClickListener {
            findNavController().navigate(R.id.profileFragment)
        }

        binding.cardDoctors.setOnClickListener {
            findNavController().navigate(R.id.action_home_to_doctors)
        }

        loadPatientData()
    }

    private fun setGreeting() {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        val greeting = when {
            hour in 0..11 -> "Good Morning"
            hour in 12..16 -> "Good Afternoon"
            else -> "Good Evening"
        }
        binding.tvGreeting.text = greeting
    }

    private fun loadPatientData() {
        val uid = sessionManager.getUid() ?: return
        CoroutineScope(Dispatchers.IO).launch {
            patientRepository.observeProfile(uid).collectLatest { patient ->
                patient?.let {
                    launch(Dispatchers.Main) {
                        displayPatientInfo(it)
                    }
                }
            }
        }
    }

    private fun displayPatientInfo(patient: Patient) {
        val name = patient.fullName.ifEmpty { "" }
        binding.tvPatientName.text = if (name.isNotEmpty()) "Hello, $name" else "Welcome!"
        binding.tvPatientInfo.text = "${patient.age} yrs \u2022 ${patient.gender} \u2022 ${patient.bloodGroup}"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
