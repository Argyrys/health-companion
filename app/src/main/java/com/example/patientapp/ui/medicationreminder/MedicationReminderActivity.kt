package com.example.patientapp.ui.medicationreminder

import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.example.patientapp.R
import com.example.patientapp.data.model.MedicationAdherence
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.utils.SessionManager
import com.google.android.material.button.MaterialButton
import com.google.firebase.Timestamp
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Locale
import javax.inject.Inject

@AndroidEntryPoint
class MedicationReminderActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    @Inject lateinit var patientRepository: PatientRepository
    @Inject lateinit var sessionManager: SessionManager

    private var tts: TextToSpeech? = null
    private var medicationName = ""
    private var timer: CountDownTimer? = null
    private var responded = false

    private val speechLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK && !responded) {
            val matches = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            val spoken = (matches?.firstOrNull() ?: "").lowercase(Locale.ROOT)
            handleVoiceResponse(spoken)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_medication_reminder)

        medicationName = intent.getStringExtra("medicationName") ?: "your medicine"

        findViewById<TextView>(R.id.tvMedicineName).text = "Time for $medicationName"
        findViewById<TextView>(R.id.tvStatus).text = "Preparing..."

        findViewById<MaterialButton>(R.id.btnYes).setOnClickListener {
            if (!responded) recordResponse(true)
        }
        findViewById<MaterialButton>(R.id.btnNo).setOnClickListener {
            if (!responded) recordResponse(false)
        }

        tts = TextToSpeech(this, this)

        timer = object : CountDownTimer(15_000, 1_000) {
            override fun onTick(millis: Long) {
                val secs = millis / 1000
                findViewById<TextView>(R.id.tvTimeout).text = "Auto-skip in ${secs}s"
            }
            override fun onFinish() {
                if (!responded) recordResponse(false)
            }
        }.start()
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.US
            tts?.setOnUtteranceCompletedListener { utteranceId ->
                if (utteranceId == "question" && !responded) {
                    startListening()
                }
            }
            speakQuestion()
        } else {
            startListening()
        }
    }

    private fun speakQuestion() {
        val question = "Have you taken your $medicationName? Say yes or no."
        val params = Bundle().apply {
            putFloat(TextToSpeech.Engine.KEY_PARAM_STREAM, android.media.AudioManager.STREAM_ALARM.toFloat())
        }
        tts?.speak(question, TextToSpeech.QUEUE_FLUSH, params, "question")
    }

    private fun startListening() {
        runOnUiThread {
            findViewById<TextView>(R.id.tvStatus).text = "Speak now: Yes or No"
        }
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Say yes or no")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        try {
            speechLauncher.launch(intent)
        } catch (_: Exception) {
            findViewById<TextView>(R.id.tvStatus).text = "Tap a button below"
        }
    }

    private fun handleVoiceResponse(spoken: String) {
        val yesWords = listOf("yes", "yeah", "yep", "taken", "done", "haan", "ji")
        val noWords = listOf("no", "nope", "not yet", "nahi", "nahin")
        when {
            yesWords.any { spoken.contains(it) } -> recordResponse(true)
            noWords.any { spoken.contains(it) } -> recordResponse(false)
            else -> {
                findViewById<TextView>(R.id.tvStatus).text = "Didn't catch that — tap a button"
            }
        }
    }

    private fun recordResponse(taken: Boolean) {
        if (responded) return
        responded = true
        timer?.cancel()

        val uid = sessionManager.getUid() ?: run { finish(); return }
        val adherence = MedicationAdherence(
            patientId = uid,
            medicationName = medicationName,
            taken = taken,
            timestamp = Timestamp.now()
        )

        CoroutineScope(Dispatchers.IO).launch {
            patientRepository.saveAdherence(adherence)
        }

        val msg = if (taken) "Great! $medicationName marked as taken." else "$medicationName marked as not taken."
        tts?.speak(msg, TextToSpeech.QUEUE_FLUSH, null, "response")

        runOnUiThread {
            findViewById<TextView>(R.id.tvStatus).text = msg
            findViewById<MaterialButton>(R.id.btnYes).isEnabled = false
            findViewById<MaterialButton>(R.id.btnNo).isEnabled = false
            android.os.Handler(mainLooper).postDelayed({ finish() }, 3000)
        }
    }

    override fun onDestroy() {
        timer?.cancel()
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}
