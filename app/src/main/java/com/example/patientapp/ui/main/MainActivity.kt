package com.example.patientapp.ui.main

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.example.patientapp.R
import com.example.patientapp.databinding.ActivityMainBinding
import com.example.patientapp.utils.AppointmentNotificationHelper
import com.example.patientapp.utils.SessionManager
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    @Inject lateinit var sessionManager: SessionManager

    private var appointmentListener: ListenerRegistration? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHostFragment.navController

        val appBarConfig = AppBarConfiguration(
            setOf(R.id.homeFragment, R.id.historyFragment, R.id.reportsFragment, R.id.profileFragment)
        )
        setupActionBarWithNavController(navController, appBarConfig)
        binding.bottomNav.setupWithNavController(navController)

        navController.addOnDestinationChangedListener { _, destination, _ ->
            binding.toolbar.title = destination.label
        }

        startAppointmentListener()
    }

    private fun startAppointmentListener() {
        val uid = sessionManager.getUid() ?: return

        appointmentListener = FirebaseFirestore.getInstance()
            .collection("appointments")
            .whereEqualTo("patientId", uid)
            .addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null) return@addSnapshotListener

                for (doc in snapshot.documents) {
                    val status = doc.getString("status") ?: continue
                    val doctorName = doc.getString("doctorName") ?: "Doctor"
                    val patientName = doc.getString("patientName") ?: ""
                    val appointmentId = doc.id

                    AppointmentNotificationHelper.onStatusChanged(
                        this, appointmentId, patientName, doctorName, status
                    )
                }
            }
    }

    override fun onDestroy() {
        super.onDestroy()
        appointmentListener?.remove()
    }

    override fun onSupportNavigateUp(): Boolean {
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        return navHostFragment.navController.navigateUp() || super.onSupportNavigateUp()
    }
}
