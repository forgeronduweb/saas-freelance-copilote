"use client";
import React from "react";
import Link from "next/link";

const CTAFinal = () => {
    return (
        <section className="py-16 bg-gradient-to-b from-slate-50 to-yellow-50">
            <div className="px-4 md:px-16 lg:px-24 xl:px-32">
                <div className="text-center">
                    <div className="bg-gradient-to-r from-yellow-500/30 to-yellow-500/40 rounded-2xl p-1">
                        <div className="flex flex-col items-center justify-center text-center py-12 md:py-16 rounded-2xl bg-white border border-yellow-200">  
                    <div className="flex items-center justify-center bg-white px-3 py-1.5 gap-1 rounded-full text-xs">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 0L9.5 5.5L15 7.5L9.5 9.5L7.5 15L5.5 9.5L0 7.5L5.5 5.5Z" fill="#f7dc6f"/>
                        </svg>
                        <span className="bg-gradient-to-r from-yellow-500 to-yellow-500 bg-clip-text text-transparent font-medium">Plan gratuit (limité) • Upgrade à tout moment</span>
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-medium mt-4 text-slate-800">
                        <span className="bg-gradient-to-r from-yellow-500 to-yellow-500 bg-clip-text text-transparent">Le Copilote du Freelance</span> <br />
                        Votre business en pilote automatique
                    </h2>
                    
                    <p className="text-slate-600 mt-4 max-w-lg max-md:text-sm">
                        Gagnez 15h par semaine avec votre assistant business personnel. Autonomie commerciale, rigueur administrative et efficacité opérationnelle. Sans commission sur votre CA.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link href="/signup">
                            <button 
                                type="button" 
                                className="bg-yellow-400 text-black text-sm px-8 py-3 rounded-xl font-medium hover:bg-yellow-500 hover:scale-105 active:scale-95 transition-all duration-300"
                            > 
                                Commencer gratuitement
                            </button>
                        </Link>
                        
                        <Link href="#demo">
                            <button 
                                type="button" 
                                className="bg-white text-yellow-600 border-2 border-yellow-500 text-sm px-8 py-3 rounded-xl font-medium hover:bg-yellow-500 hover:scale-105 active:scale-95 transition-all duration-300"
                            > 
                                Voir la démo
                            </button>
                        </Link>
                    </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTAFinal;
