package com.example.patientapp.ui.mentalhealth

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.patientapp.R
import com.example.patientapp.data.model.MentalHealth
import com.example.patientapp.data.model.MentalHealthQuestion
import com.example.patientapp.data.repository.PatientRepository
import com.example.patientapp.databinding.FragmentMentalHealthBinding
import com.example.patientapp.utils.Constants
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID
import javax.inject.Inject

@AndroidEntryPoint
class MentalHealthFragment : Fragment() {

    private var _binding: FragmentMentalHealthBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var sessionManager: SessionManager
    @Inject lateinit var patientRepository: PatientRepository

    private val radioGroups = mutableListOf<RadioGroup>()
    private val options = Constants.MENTAL_HEALTH_OPTIONS
    private var fullAnalysisText = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMentalHealthBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        createQuestions()
        binding.btnSubmit.setOnClickListener { calculateAndSave() }
        binding.btnCopy.setOnClickListener { copyAnalysis() }
        binding.btnDownload.setOnClickListener { downloadAnalysis() }
    }

    private fun createQuestions() {
        val questions = Constants.MENTAL_HEALTH_QUESTIONS
        val categories = Constants.MENTAL_HEALTH_CATEGORIES

        var lastCategory = ""
        questions.forEachIndexed { index, question ->
            val category = categories[index]

            if (category != lastCategory) {
                val header = TextView(requireContext()).apply {
                    text = category
                    textSize = 14f
                    setTextColor(ContextCompat.getColor(context, R.color.primary))
                    setPadding(0, if (lastCategory.isEmpty()) 0 else 24, 0, 4)
                    paint.isFakeBoldText = true
                }
                binding.llQuestions.addView(header)
                lastCategory = category
            }

            val cardView = com.google.android.material.card.MaterialCardView(requireContext()).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { setMargins(0, 4, 0, 4) }
                radius = 12f
                cardElevation = 2f
                setCardBackgroundColor(ContextCompat.getColor(context, R.color.card_background))
            }

            val layout = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(32, 20, 32, 20)
            }

            val tvQuestion = TextView(requireContext()).apply {
                text = "${index + 1}. $question"
                textSize = 14f
                setTextColor(ContextCompat.getColor(context, R.color.text_primary))
            }
            layout.addView(tvQuestion)

            val radioGroup = RadioGroup(requireContext()).apply {
                orientation = RadioGroup.VERTICAL
                setPadding(0, 8, 0, 0)
            }

            options.forEachIndexed { optIndex, option ->
                val rb = RadioButton(requireContext()).apply {
                    id = optIndex + 1
                    text = option
                    textSize = 13f
                    setPadding(8, 4, 0, 4)
                }
                radioGroup.addView(rb)
            }

            layout.addView(radioGroup)
            cardView.addView(layout)
            binding.llQuestions.addView(cardView)
            radioGroups.add(radioGroup)
        }
    }

    private fun calculateAndSave() {
        val answers = mutableListOf<Int>()
        radioGroups.forEachIndexed { index, rg ->
            val checkedId = rg.checkedRadioButtonId
            if (checkedId == -1) {
                requireContext().showToast("Please answer question ${index + 1}")
                return
            }
            answers.add(checkedId)
        }

        val scoreMap = mapOf(1 to 5, 2 to 4, 3 to 3, 4 to 2, 5 to 1)
        val reverseScoreMap = mapOf(1 to 1, 2 to 2, 3 to 3, 4 to 4, 5 to 5)

        val scores = answers.mapIndexed { index, answer ->
            if (index in Constants.REVERSE_SCORED_INDICES) reverseScoreMap[answer] ?: 3
            else scoreMap[answer] ?: 3
        }

        val totalScore = scores.sum()
        val maxScore = answers.size * 5

        val categoryScores = mutableMapOf<String, MutableList<Int>>()
        Constants.MENTAL_HEALTH_CATEGORIES.forEachIndexed { index, cat ->
            categoryScores.getOrPut(cat) { mutableListOf() }.add(scores[index])
        }
        val categoryAverages = categoryScores.mapValues { (_, v) -> v.average() }

        val percentage = (totalScore.toFloat() / maxScore) * 100
        val status = when {
            percentage >= 80 -> "Excellent"
            percentage >= 60 -> "Good"
            percentage >= 40 -> "Moderate"
            percentage >= 20 -> "Needs Attention"
            else -> "Seek Support"
        }

        val observations = mutableListOf<String>()
        categoryAverages.forEach { (cat, avg) ->
            val catScore = (avg / 5.0 * 100).toInt()
            val level = when {
                catScore >= 80 -> "Excellent"
                catScore >= 60 -> "Good"
                catScore >= 40 -> "Moderate"
                else -> "Needs Attention"
            }
            observations.add("$cat: $level ($catScore%)")
        }

        binding.cardScore.visibility = View.VISIBLE
        binding.tvScore.text = "Overall Score: $totalScore/$maxScore"
        binding.tvScore.setTextColor(
            when {
                percentage >= 80 -> ContextCompat.getColor(requireContext(), R.color.success_green)
                percentage >= 60 -> ContextCompat.getColor(requireContext(), R.color.mental_good)
                percentage >= 40 -> ContextCompat.getColor(requireContext(), R.color.warning_orange)
                else -> ContextCompat.getColor(requireContext(), R.color.danger_red)
            }
        )
        binding.tvStatus.text = "Status: $status"

        val analysis = StringBuilder()
        analysis.appendLine("MENTAL HEALTH SCREENING RESULTS")
        analysis.appendLine("Generated: ${SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault()).format(Date())}")
        analysis.appendLine("\nScore: $totalScore/$maxScore")
        analysis.appendLine("Status: $status\n")
        analysis.appendLine("Category Breakdown:")
        observations.forEach { analysis.appendLine("\u2022 $it") }
        analysis.appendLine("\nKey Observations:")
        if (percentage >= 60) {
            analysis.appendLine("\u2022 Your overall mental wellbeing appears good")
            analysis.appendLine("\u2022 Maintain your current healthy habits")
        } else {
            analysis.appendLine("\u2022 Some areas may benefit from attention")
            analysis.appendLine("\u2022 Consider speaking with a healthcare professional")
        }
        analysis.appendLine("\nRecommendations:")
        analysis.appendLine("\u2022 Maintain a regular sleep schedule")
        analysis.appendLine("\u2022 Practice relaxation techniques like deep breathing")
        analysis.appendLine("\u2022 Stay physically active")
        analysis.appendLine("\u2022 Connect with friends and family regularly")
        analysis.appendLine("\nDisclaimer: This screening is an assessment tool and not a medical diagnosis.")

        fullAnalysisText = analysis.toString()
        binding.tvAnalysis.text = fullAnalysisText

        val uid = sessionManager.getUid() ?: return
        val questions = Constants.MENTAL_HEALTH_QUESTIONS.mapIndexed { i, q ->
            MentalHealthQuestion(question = q, answer = answers[i])
        }
        val mentalHealth = MentalHealth(
            id = UUID.randomUUID().toString(),
            patientId = uid,
            questions = questions,
            score = totalScore,
            status = status,
            createdAt = Timestamp.now()
        )
        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            patientRepository.saveMentalHealth(mentalHealth)
        }
    }

    private fun copyAnalysis() {
        if (fullAnalysisText.isEmpty()) {
            requireContext().showToast("No analysis to copy")
            return
        }
        val clipboard = requireContext().getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("Mental Health Analysis", fullAnalysisText)
        clipboard.setPrimaryClip(clip)
        requireContext().showToast("Analysis copied successfully")
    }

    private fun downloadAnalysis() {
        if (fullAnalysisText.isEmpty()) {
            requireContext().showToast("No analysis to download")
            return
        }

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val fileName = "MentalHealth_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())}.pdf"
                val file = File(requireContext().getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), fileName)
                file.parentFile?.mkdirs()

                val pdfWriter = PdfWriter(file)
                val pdfDocument = PdfDocument(pdfWriter)
                val document = Document(pdfDocument)

                val blueColor = DeviceRgb(26, 115, 232)

                document.add(Paragraph("MENTAL HEALTH SCREENING RESULTS")
                    .setBold().setFontSize(18f).setFontColor(blueColor)
                    .setTextAlignment(TextAlignment.CENTER))
                document.add(Paragraph("Generated: ${SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault()).format(Date())}")
                    .setFontSize(10f).setTextAlignment(TextAlignment.CENTER))
                document.add(Paragraph("\n"))

                // Split analysis by lines and add to PDF
                fullAnalysisText.lines().forEach { line ->
                    if (line.startsWith("MENTAL HEALTH") || line.startsWith("Score:") || line.startsWith("Status:")) {
                        document.add(Paragraph(line).setBold().setFontSize(14f).setFontColor(blueColor))
                    } else if (line.startsWith("Category") || line.startsWith("Key") || line.startsWith("Recommendations") || line.startsWith("Disclaimer")) {
                        document.add(Paragraph(line).setBold().setFontSize(12f))
                    } else {
                        document.add(Paragraph(line).setFontSize(11f))
                    }
                }

                document.close()

                launch(Dispatchers.Main) {
                    val uri = FileProvider.getUriForFile(
                        requireContext(),
                        "${requireContext().packageName}.fileprovider",
                        file
                    )
                    val shareIntent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                        type = "application/pdf"
                        putExtra(android.content.Intent.EXTRA_STREAM, uri)
                        putExtra(android.content.Intent.EXTRA_SUBJECT, "Mental Health Assessment")
                        addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    startActivity(android.content.Intent.createChooser(shareIntent, "Save/Share Analysis"))
                    requireContext().showToast("Analysis PDF generated")
                }
            } catch (e: Exception) {
                launch(Dispatchers.Main) {
                    requireContext().showToast("Failed to generate PDF: ${e.message}")
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
