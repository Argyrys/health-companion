package com.example.patientapp.ui.report

import android.content.ContentValues
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.FileProvider
import androidx.fragment.app.Fragment
import com.example.patientapp.databinding.FragmentShareReportBinding
import com.example.patientapp.utils.showToast
import dagger.hilt.android.AndroidEntryPoint
import java.io.File
import java.io.FileOutputStream

@AndroidEntryPoint
class ShareReportFragment : Fragment() {

    private var _binding: FragmentShareReportBinding? = null
    private val binding get() = _binding!!

    private var latestPdf: File? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentShareReportBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        latestPdf = findLatestPdf()

        if (latestPdf == null) {
            binding.btnDownload.isEnabled = false
            binding.btnShare.isEnabled = false
            requireContext().showToast("No report found. Generate one in Reports first.")
        }

        binding.btnDownload.setOnClickListener { downloadPdf() }
        binding.btnShare.setOnClickListener { shareViaIntent() }
    }

    private fun findLatestPdf(): File? {
        val docsDir = requireContext().getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
        if (docsDir == null || !docsDir.exists()) return null
        val pdfFiles = docsDir.listFiles { file -> file.name.endsWith(".pdf") }
            ?.sortedByDescending { it.lastModified() }
        return pdfFiles?.firstOrNull()
    }

    private fun downloadPdf() {
        val file = latestPdf ?: run {
            requireContext().showToast("No report to download")
            return
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, file.name)
                    put(MediaStore.Downloads.MIME_TYPE, "application/pdf")
                    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }
                val uri = requireContext().contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                if (uri != null) {
                    requireContext().contentResolver.openOutputStream(uri)?.use { output ->
                        file.inputStream().use { input -> input.copyTo(output) }
                    }
                    requireContext().showToast("Report saved to Downloads")
                } else {
                    requireContext().showToast("Failed to save report")
                }
            } else {
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                downloadsDir.mkdirs()
                val dest = File(downloadsDir, file.name)
                file.copyTo(dest, overwrite = true)
                requireContext().showToast("Report saved to Downloads/${file.name}")
            }
        } catch (e: Exception) {
            requireContext().showToast("Download failed: ${e.message}")
        }
    }

    private fun shareViaIntent() {
        val file = latestPdf ?: run {
            requireContext().showToast("No report to share")
            return
        }

        val uri = FileProvider.getUriForFile(
            requireContext(),
            "${requireContext().packageName}.fileprovider",
            file
        )
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, "Patient Health Report")
            putExtra(Intent.EXTRA_TEXT, "Please find my health report attached.")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(Intent.createChooser(shareIntent, "Share Report"))
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
