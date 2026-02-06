import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Logo from "../../../../assets/logo.png";
import DefaultChair from "../../../../assets/chair.png";

const StoreBanner = ({ slides }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    if (!slides || slides.length === 0) return null;

    return (
        <section className="py-6">
            <div className="relative group">
                <div className="overflow-hidden rounded-3xl shadow-lg">
                    <div
                        className="flex transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {slides.map((slide, index) => (
                            <div key={index} className="w-full flex-shrink-0">
                                <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-[300px] md:h-[450px] p-8 md:p-16 flex items-center relative overflow-hidden">
                                    {/* Left side – logo + text */}
                                    <div className="w-full md:w-1/2 z-10">
                                        <img
                                            src={Logo}
                                            className="w-52 transform max-sm:w-32 translate-x-[-12px] mb-4 md:mb-6"
                                            alt="Logo"
                                        />
                                        <h2 className="text-2xl md:text-5xl text-white mb-4 leading-tight whitespace-pre-line font-bold max-h-[140px] md:max-h-[200px] overflow-hidden">
                                            {slide.title}
                                        </h2>
                                        <p className="text-sm md:text-lg text-cyan-50 mb-8 max-w-md line-clamp-3 md:line-clamp-none">
                                            {slide.description}
                                        </p>
                                    </div>

                                    {/* Right side – image */}
                                    <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 w-1/2 flex justify-end">
                                        <img
                                            src={slide.img || DefaultChair}
                                            alt={slide.title}
                                            className="h-48 md:h-[350px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = DefaultChair;
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <ArrowLeft className="text-white" size={24} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity rotate-180 cursor-pointer"
                >
                    <ArrowLeft className="text-white" size={24} />
                </button>
            </div>
        </section>
    );
};

export default StoreBanner;
