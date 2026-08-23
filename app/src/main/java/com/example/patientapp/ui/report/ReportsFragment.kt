package com.example.patientapp.ui.report

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.FileProvider
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.patientapp.R
import com.example.patientapp.data.model.Report
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.data.repository.StorageRepository
import com.example.patientapp.databinding.FragmentReportsBinding
import com.example.patientapp.utils.SessionManager
import com.example.patientapp.utils.showToast
import com.google.firebase.Timestamp
import com.itextpdf.kernel.colors.DeviceRgb
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.layout.Document
import com.itextpdf.layout.element.Paragraph
import com.itextpdf.layout.properties.TextAlignment
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject

@AndroidEntryPoint
class ReportsFragment : Fragment() {

    private var _binding: FragmentReportsBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository
    @Inject lateinit var storageRepository: StorageRepository

    private val reports = mutableListOf<Report>()
    private lateinit var adapter: ReportAdapter
    private var lastGeneratedPdf: File? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentReportsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = ReportAdapter(reports) { report ->
            if (report.pdfUrl.isNotEmpty()) {
                openShareSheet(report.pdfUrl)
            } else {
                lastGeneratedPdf?.let { shareLocalPdf(it) }
            }
        }
        binding.rvReports.layoutManager = LinearLayoutManager(requireContext())
        binding.rvReports.adapter = adapter

        binding.btnGenerate.setOnClickListener { generatePdfReport() }
        loadReports()
    }

    private fun loadReports() {
        val uid = sessionManager.getUid() ?: return
        CoroutineScope(Dispatchers.IO).launch {
            patientRepository.observeReports(uid).collectLatest { list ->
                if (_binding == null) return@collectLatest
                launch(Dispatchers.Main) {
                    if (_binding == null) return@launch
                    reports.clear()
                    reports.addAll(list)
                    adapter.notifyDataSetChanged()
                    if (list.isEmpty()) {
                        binding.tvEmpty.visibility = View.VISIBLE
                        binding.rvReports.visibility = View.GONE
                    } else {
                        binding.tvEmpty.visibility = View.GONE
                        binding.rvReports.visibility = View.VISIBLE
                    }
                }
            }
        }
    }

    private fun generatePdfReport() {
        val uid = sessionManager.getUid() ?: return
        binding.progressBar.visibility = View.VISIBLE
        binding.btnGenerate.isEnabled = false

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val patient = patientRepository.getProfile(uid)
                val caseTaking = patientRepository.observeCaseTaking(uid).first() ?: com.example.patientapp.data.model.CaseTaking()
                val medicalHistory = patientRepository.observeMedicalHistory(uid).first() ?: com.example.patientapp.data.model.MedicalHistory()
                val familyHistory = patientRepository.observeFamilyHistory(uid).first() ?: com.example.patientapp.data.model.FamilyHistory()
                val medications = patientRepository.observeMedications(uid).first()
                val allergies = patientRepository.observeAllergies(uid).first()
                val mentalHealth = patientRepository.observeMentalHealth(uid).first()
                val voiceTranscription = patientRepository.getVoiceTranscription(uid) ?: ""

                val fileName = "PatientReport_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())}.pdf"
                val file = File(requireContext().getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), fileName)
                file.parentFile?.mkdirs()

                val pdfWriter = PdfWriter(file)
                val pdfDocument = PdfDocument(pdfWriter)
                val document = Document(pdfDocument)

                val blueColor = DeviceRgb(26, 115, 232)
                val grayColor = DeviceRgb(117, 117, 117)

                document.add(Paragraph("PATIENT HEALTH REPORT")
                    .setBold().setFontSize(20f).setFontColor(blueColor)
                    .setTextAlignment(TextAlignment.CENTER))
                document.add(Paragraph("Generated: ${SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault()).format(Date())}")
                    .setFontSize(10f).setFontColor(grayColor)
                    .setTextAlignment(TextAlignment.CENTER))
                document.add(Paragraph("\n"))

                document.add(Paragraph("PATIENT INFORMATION").setBold().setFontSize(14f).setFontColor(blueColor))
                document.add(Paragraph("Name: ${patient?.fullName ?: "N/A"}"))
                document.add(Paragraph("Age: ${patient?.age ?: "N/A"}"))
                document.add(Paragraph("Gender: ${patient?.gender ?: "N/A"}"))
                document.add(Paragraph("Blood Group: ${patient?.bloodGroup ?: "N/A"}"))
                document.add(Paragraph("Phone: ${patient?.phoneNumber ?: "N/A"}"))
                document.add(Paragraph("\n"))

                document.add(Paragraph("CASE TAKING").setBold().setFontSize(14f).setFontColor(blueColor))
                document.add(Paragraph("Chief Complaint: ${caseTaking.chiefComplaint}"))
                document.add(Paragraph("Symptoms: ${caseTaking.symptoms.joinToString(", ")}"))
                document.add(Paragraph("Severity: ${caseTaking.severity}/10"))
                document.add(Paragraph("Duration: ${caseTaking.durationValue} ${caseTaking.durationUnit}"))
                document.add(Paragraph("\n"))

                if (voiceTranscription.isNotEmpty()) {
                    document.add(Paragraph("VOICE DESCRIPTION").setBold().setFontSize(14f).setFontColor(blueColor))
                    document.add(Paragraph(voiceTranscription))
                    document.add(Paragraph("\n"))
                }

                document.add(Paragraph("MEDICAL HISTORY").setBold().setFontSize(14f).setFontColor(blueColor))
                val conditions = mutableListOf<String>()
                if (medicalHistory.diabetes) conditions.add("Diabetes")
                if (medicalHistory.hypertension) conditions.add("Hypertension")
                if (medicalHistory.asthma) conditions.add("Asthma")
                if (medicalHistory.heartDisease) conditions.add("Heart Disease")
                if (medicalHistory.previousSurgery) conditions.add("Previous Surgery")
                if (medicalHistory.hospitalization) conditions.add("Hospitalization")
                conditions.addAll(medicalHistory.otherConditions)
                document.add(Paragraph("Conditions: ${conditions.joinToString(", ").ifEmpty { "None" }}"))
                document.add(Paragraph("\n"))

                document.add(Paragraph("FAMILY HISTORY").setBold().setFontSize(14f).setFontColor(blueColor))
                familyHistory.entries.forEach { entry ->
                    document.add(Paragraph("\u2022 ${entry.condition} (${entry.relationship})"))
                }
                document.add(Paragraph("\n"))

                document.add(Paragraph("CURRENT MEDICATIONS").setBold().setFontSize(14f).setFontColor(blueColor))
                medications.forEach { med ->
                    document.add(Paragraph("\u2022 ${med.drugName} - ${med.dosage} (${med.frequency})"))
                }
                document.add(Paragraph("\n"))

                document.add(Paragraph("ALLERGIES").setBold().setFontSize(14f).setFontColor(blueColor))
                allergies.forEach { allergy ->
                    document.add(Paragraph("\u2022 ${allergy.allergen} (${allergy.allergyType}) - Severity: ${allergy.severity}"))
                }
                document.add(Paragraph("\n"))

                document.add(Paragraph("MENTAL HEALTH SCREENING").setBold().setFontSize(14f).setFontColor(blueColor))
                document.add(Paragraph("Score: ${mentalHealth?.score ?: 0}/${(mentalHealth?.questions?.size ?: 10) * 5}"))
                document.add(Paragraph("Status: ${mentalHealth?.status ?: "N/A"}"))
                document.add(Paragraph("\n"))

                document.add(Paragraph("DISCLAIMER").setBold().setFontSize(12f).setFontColor(grayColor))
                document.add(Paragraph("This report is for informational purposes only and does not constitute medical advice. Generated by Patient Health App.").setFontSize(9f).setFontColor(grayColor))

                document.close()

                if (_binding != null) {
                    launch(Dispatchers.Main) {
                        if (_binding == null) return@launch
                        binding.progressBar.visibility = View.GONE
                        binding.btnGenerate.isEnabled = true
                        lastGeneratedPdf = file
                        requireContext().showToast("PDF report generated successfully")
                        shareLocalPdf(file)
                        CoroutineScope(Dispatchers.IO).launch {
                            val report = Report(patientId = uid, createdAt = Timestamp.now())
                            patientRepository.saveReport(report)
                        }
                    }
                }
            } catch (e: Exception) {
                if (_binding != null) {
                    launch(Dispatchers.Main) {
                        if (_binding == null) return@launch
                        binding.progressBar.visibility = View.GONE
                        binding.btnGenerate.isEnabled = true
                        requireContext().showToast("Failed to generate PDF: ${e.message}")
                    }
                }
            }
        }
    }

    private fun shareLocalPdf(file: File) {
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

    private fun openShareSheet(pdfUrl: String) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse(pdfUrl)
            type = "application/pdf"
        }
        startActivity(Intent.createChooser(intent, "Open Report"))
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
