package com.example.patientapp.ui.home

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.patientapp.R

class CarouselAdapter(private val items: List<CarouselItem>) :
    RecyclerView.Adapter<CarouselAdapter.CarouselViewHolder>() {

    class CarouselViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val gradient: View = view.findViewById(R.id.viewGradient)
        val emoji: TextView = view.findViewById(R.id.tvCarouselEmoji)
        val title: TextView = view.findViewById(R.id.tvCarouselTitle)
        val subtitle: TextView = view.findViewById(R.id.tvCarouselSubtitle)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CarouselViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_carousel, parent, false)
        return CarouselViewHolder(view)
    }

    override fun onBindViewHolder(holder: CarouselViewHolder, position: Int) {
        val item = items[position]
        holder.emoji.text = item.emoji
        holder.title.text = item.title
        holder.subtitle.text = item.subtitle
        holder.gradient.setBackgroundResource(item.bgRes)
    }

    override fun getItemCount(): Int = items.size
}
