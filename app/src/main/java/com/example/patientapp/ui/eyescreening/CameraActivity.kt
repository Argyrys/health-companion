package com.example.patientapp.ui.eyescreening

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import com.example.patientapp.databinding.ActivityCameraBinding
import dagger.hilt.android.AndroidEntryPoint
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

@AndroidEntryPoint
class CameraActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCameraBinding
    private var imageCapture: ImageCapture? = null
    private var photoFile: File? = null
    private var cameraProvider: ProcessCameraProvider? = null
    private var cameraExecutor: ExecutorService? = null
    private var useFrontCamera = false

    private val TAG = "CameraActivity"

    private val cameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            startCamera()
        } else {
            Toast.makeText(this, "Camera permission is required", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCameraBinding.inflate(layoutInflater)
        setContentView(binding.root)

        cameraExecutor = Executors.newSingleThreadExecutor()

        binding.btnCapture.setOnClickListener { takePhoto() }
        binding.btnRetake.setOnClickListener { showCamera() }
        binding.btnConfirm.setOnClickListener { confirmPhoto() }
        binding.btnFlipCamera.setOnClickListener { flipCamera() }

        checkCameraPermission()
    }

    private fun checkCameraPermission() {
        when {
            ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED -> {
                startCamera()
            }
            else -> {
                cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({
            try {
                cameraProvider = cameraProviderFuture.get()
                bindCameraUseCases()
            } catch (e: Exception) {
                Log.e(TAG, "Camera initialization failed", e)
                Toast.makeText(this, "Camera initialization failed: ${e.message}", Toast.LENGTH_LONG).show()
                finish()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun bindCameraUseCases() {
        val provider = cameraProvider ?: return

        val preview = Preview.Builder()
            .build()
            .also {
                it.setSurfaceProvider(binding.previewView.surfaceProvider)
            }

        imageCapture = ImageCapture.Builder()
            .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
            .build()

        try {
            provider.unbindAll()

            val cameraSelector = if (useFrontCamera) {
                CameraSelector.DEFAULT_FRONT_CAMERA
            } else {
                CameraSelector.DEFAULT_BACK_CAMERA
            }

            provider.bindToLifecycle(
                this,
                cameraSelector,
                preview,
                imageCapture
            )

            Log.d(TAG, "Camera bound successfully (${if (useFrontCamera) "FRONT" else "BACK"})")
        } catch (e: Exception) {
            Log.e(TAG, "Camera binding failed", e)
            Toast.makeText(this, "Camera binding failed: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun flipCamera() {
        useFrontCamera = !useFrontCamera
        bindCameraUseCases()
        val cameraName = if (useFrontCamera) "Front" else "Back"
        Toast.makeText(this, "Switched to ${cameraName} camera", Toast.LENGTH_SHORT).show()
    }

    private fun takePhoto() {
        val imageCapture = imageCapture ?: run {
            Toast.makeText(this, "Camera not ready. Please try again.", Toast.LENGTH_SHORT).show()
            return
        }

        val fileName = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())
            .format(System.currentTimeMillis())
        photoFile = File(cacheDir, "eye_${fileName}.jpg")

        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile!!).build()

        imageCapture.takePicture(
            outputOptions,
            ContextCompat.getMainExecutor(this),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    val bitmap = BitmapFactory.decodeFile(photoFile?.absolutePath)
                    if (bitmap != null) {
                        binding.ivPreview.setImageBitmap(bitmap)
                        showPreview()
                    } else {
                        Toast.makeText(this@CameraActivity, "Failed to process captured image", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onError(exception: ImageCaptureException) {
                    Toast.makeText(this@CameraActivity, "Capture failed: ${exception.message}", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }

    private fun showCamera() {
        binding.previewView.visibility = View.VISIBLE
        binding.ivPreview.visibility = View.GONE
        binding.llCaptureButtons.visibility = View.VISIBLE
        binding.llPreviewButtons.visibility = View.GONE
        binding.btnFlipCamera.visibility = View.VISIBLE
        bindCameraUseCases()
    }

    private fun showPreview() {
        binding.previewView.visibility = View.GONE
        binding.ivPreview.visibility = View.VISIBLE
        binding.llCaptureButtons.visibility = View.GONE
        binding.llPreviewButtons.visibility = View.VISIBLE
        binding.btnFlipCamera.visibility = View.GONE
    }

    private fun confirmPhoto() {
        photoFile?.let { file ->
            val uri = Uri.fromFile(file)
            val resultIntent = Intent()
            resultIntent.putExtra("photoUri", uri.toString())
            setResult(RESULT_OK, resultIntent)
            finish()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor?.shutdown()
    }
}
