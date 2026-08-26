package com.example.patientapp.ui.home

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import androidx.viewpager2.widget.ViewPager2
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

    private val autoScrollHandler = Handler(Looper.getMainLooper())
    private val autoScrollDelay = 4000L

    private val carouselItems = listOf(
        CarouselItem("\uD83D\uDC8A", "AI Eye Screening", "Scan your eyes with AI-powered analysis", R.drawable.bg_carousel_blue),
        CarouselItem("\uD83E\uDDE0", "Mental Health Check", "Take a quick mental health assessment", R.drawable.bg_carousel_green),
        CarouselItem("\uD83D\uDC64", "Find Doctors", "Connect with verified specialists nearby", R.drawable.bg_carousel_orange),
        CarouselItem("\uD83D\uDCCB", "Health Records", "Keep all your reports in one place", R.drawable.bg_carousel_purple)
    )

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

        setGreeting()
        setupCarousel()

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

        binding.cardAppointments.setOnClickListener {
            findNavController().navigate(R.id.action_home_to_appointments)
        }

        val uid = sessionManager.getUid()
        if (uid.isNullOrEmpty()) {
            binding.btnSignIn.visibility = View.VISIBLE
        } else {
            binding.btnSignIn.visibility = View.GONE
            loadPatientData()
        }
    }

    private fun setupCarousel() {
        val carouselAdapter = CarouselAdapter(carouselItems)
        binding.viewPagerCarousel.adapter = carouselAdapter

        // Auto-scroll
        val autoScrollRunnable = object : Runnable {
            override fun run() {
                if (_binding == null) return
                val next = (binding.viewPagerCarousel.currentItem + 1) % carouselItems.size
                binding.viewPagerCarousel.currentItem = next
                autoScrollHandler.postDelayed(this, autoScrollDelay)
            }
        }
        autoScrollHandler.postDelayed(autoScrollRunnable, autoScrollDelay)
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
        autoScrollHandler.removeCallbacksAndMessages(null)
        super.onDestroyView()
        _binding = null
    }
}

data class CarouselItem(val emoji: String, val title: String, val subtitle: String, val bgRes: Int)
