package com.example.patientapp.utils

import android.content.Context
import android.content.SharedPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences(Constants.PREFS_NAME, Context.MODE_PRIVATE)

    fun saveUid(uid: String) {
        prefs.edit().putString(Constants.KEY_UID, uid).apply()
    }

    fun getUid(): String? = prefs.getString(Constants.KEY_UID, null)

    fun saveEmail(email: String) {
        prefs.edit().putString("email", email).apply()
    }

    fun getEmail(): String? = prefs.getString("email", null)

    fun savePhone(phone: String) {
        prefs.edit().putString(Constants.KEY_PHONE, phone).apply()
    }

    fun getPhone(): String? = prefs.getString(Constants.KEY_PHONE, null)

    fun setRegistered(registered: Boolean) {
        prefs.edit().putBoolean(Constants.KEY_REGISTERED, registered).apply()
    }

    fun isRegistered(): Boolean = prefs.getBoolean(Constants.KEY_REGISTERED, false)

    fun isLoggedIn(): Boolean = getUid() != null

    fun clear() {
        prefs.edit().clear().apply()
    }
}
