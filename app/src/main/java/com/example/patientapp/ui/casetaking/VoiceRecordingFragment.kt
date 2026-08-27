package com.example.patientapp.ui.casetaking

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.os.Bundle
import android.os.SystemClock
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentVoiceRecordingBinding
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.UUID
import javax.inject.Inject

@AndroidEntryPoint
class VoiceRecordingFragment : Fragment() {

    private var _binding: FragmentVoiceRecordingBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    private var recorder: MediaRecorder? = null
    private var player: MediaPlayer? = null
    private var audioFile: File? = null
    private var isRecording = false
    private var isPlaying = false
    private var savedTranscription: String? = null
    private var speechRecognizer: SpeechRecognizer? = null

    private val micPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) startRecording()
        else requireContext().showToast("Microphone permission is required")
    }

    private val speechLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == android.app.Activity.RESULT_OK) {
            val matches = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            if (!matches.isNullOrEmpty()) {
                val transcribed = matches[0]
                binding.cardTranscription.visibility = View.VISIBLE
                binding.etTranscription.setText(transcribed)
                binding.etTranscription.isEnabled = false
                binding.btnSaveTranscription.visibility = View.VISIBLE
                binding.tvRecordingStatus.text = "Voice transcribed successfully"
            } else {
                binding.tvRecordingStatus.text = "No speech detected. Try again."
            }
        } else {
            binding.tvRecordingStatus.text = "Transcription cancelled. Tap Edit to try again."
            binding.cardTranscription.visibility = View.VISIBLE
            binding.etTranscription.setText("")
            binding.etTranscription.isEnabled = true
        }
        binding.progressBar.visibility = View.GONE
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentVoiceRecordingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Load saved transcription if any
        loadSavedTranscription()

        binding.btnRecord.setOnClickListener {
            if (isRecording) stopRecording() else checkMicPermission()
        }

        binding.btnPlay.setOnClickListener {
            if (isPlaying) stopPlayback() else playRecording()
        }

        binding.btnDelete.setOnClickListener {
            deleteRecording()
        }

        binding.btnEdit.setOnClickListener {
            binding.etTranscription.isEnabled = true
            binding.etTranscription.requestFocus()
            binding.btnSaveTranscription.visibility = View.VISIBLE
        }

        binding.btnSaveTranscription.setOnClickListener {
            saveTranscription()
        }

        binding.btnRecordAgain.setOnClickListener {
            resetForNewRecording()
        }
    }

    private fun loadSavedTranscription() {
        val uid = sessionManager.getUid() ?: return
        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            val text = patientRepository.getVoiceTranscription(uid)
            if (!text.isNullOrEmpty()) {
                savedTranscription = text
                launch(Dispatchers.Main) {
                    binding.cardSaved.visibility = View.VISIBLE
                    binding.tvSavedText.text = text
                }
            }
        }
    }

    private fun checkMicPermission() {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.RECORD_AUDIO)
            == PackageManager.PERMISSION_GRANTED) {
            startRecording()
        } else {
            micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    private fun startRecording() {
        audioFile = File(requireContext().cacheDir, "recording_${UUID.randomUUID()}.mp3")

        recorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setOutputFile(audioFile?.absolutePath)
            prepare()
            start()
        }

        isRecording = true
        binding.btnRecord.text = "Stop Recording"
        binding.tvRecordingStatus.text = "Recording..."
        binding.chronometer.base = SystemClock.elapsedRealtime()
        binding.chronometer.start()
        binding.chronometer.visibility = View.VISIBLE
        binding.btnPlay.visibility = View.GONE
        binding.btnDelete.visibility = View.GONE
        binding.cardTranscription.visibility = View.GONE
        binding.cardSaved.visibility = View.GONE
    }

    private fun stopRecording() {
        try {
            recorder?.stop()
            recorder?.release()
            recorder = null
        } catch (e: Exception) {
            requireContext().showToast("Recording failed")
        }

        isRecording = false
        binding.btnRecord.text = "Start Recording"
        binding.tvRecordingStatus.text = "Recording saved. Transcribing..."
        binding.chronometer.stop()
        binding.btnPlay.visibility = View.VISIBLE
        binding.btnDelete.visibility = View.VISIBLE

        // Automatically start speech-to-text
        startSpeechToText()
    }

    private fun startSpeechToText() {
        if (!SpeechRecognizer.isRecognitionAvailable(requireContext())) {
            binding.tvRecordingStatus.text = "Speech recognition not available on this device"
            // Still show the transcription card so user can type manually
            binding.cardTranscription.visibility = View.VISIBLE
            binding.etTranscription.setText("")
            binding.etTranscription.isEnabled = true
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.tvRecordingStatus.text = "Converting speech to text..."

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(requireContext())
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
        }
        speechLauncher.launch(intent)
    }

    private fun playRecording() {
        audioFile?.let { file ->
            if (!file.exists()) {
                requireContext().showToast("No recording found")
                return
            }
            player = MediaPlayer().apply {
                setDataSource(file.absolutePath)
                prepare()
                start()
                setOnCompletionListener {
                    this@VoiceRecordingFragment.isPlaying = false
                    binding.btnPlay.text = "Play"
                    binding.tvRecordingStatus.text = "Playback complete"
                }
            }
            isPlaying = true
            binding.btnPlay.text = "Stop"
            binding.tvRecordingStatus.text = "Playing..."
        }
    }

    private fun stopPlayback() {
        player?.stop()
        player?.release()
        player = null
        isPlaying = false
        binding.btnPlay.text = "Play"
        binding.tvRecordingStatus.text = "Recording saved"
    }

    private fun deleteRecording() {
        audioFile?.delete()
        audioFile = null
        player?.release()
        player = null
        isPlaying = false
        binding.btnPlay.visibility = View.GONE
        binding.btnDelete.visibility = View.GONE
        binding.cardTranscription.visibility = View.GONE
        binding.tvRecordingStatus.text = "Ready to record"
    }

    private fun saveTranscription() {
        val text = binding.etTranscription.text.toString().trim()
        if (text.isEmpty()) {
            requireContext().showToast("Please enter or transcribe some text")
            return
        }

        val uid = sessionManager.getUid() ?: run {
            requireContext().showToast("Please login to save")
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.btnSaveTranscription.isEnabled = false

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            patientRepository.saveVoiceTranscription(uid, text)
            savedTranscription = text
            withContext(Dispatchers.Main) {
                binding.progressBar.visibility = View.GONE
                binding.btnSaveTranscription.isEnabled = true
                binding.etTranscription.isEnabled = false
                binding.cardSaved.visibility = View.VISIBLE
                binding.tvSavedText.text = text
                binding.tvRecordingStatus.text = "Voice description saved successfully"
                requireContext().showToast("Voice description saved successfully")
            }
        }
    }

    private fun resetForNewRecording() {
        savedTranscription = null
        audioFile?.delete()
        audioFile = null
        player?.release()
        player = null
        isPlaying = false
        isRecording = false

        binding.cardTranscription.visibility = View.GONE
        binding.cardSaved.visibility = View.GONE
        binding.btnPlay.visibility = View.GONE
        binding.btnDelete.visibility = View.GONE
        binding.chronometer.visibility = View.GONE
        binding.btnRecord.text = "Start Recording"
        binding.tvRecordingStatus.text = "Ready to record"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        recorder?.release()
        player?.release()
        speechRecognizer?.destroy()
        _binding = null
    }
}
