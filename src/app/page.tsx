'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">♟️</div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Ajedrez Online con
            <span className="text-blue-600 dark:text-blue-400"> IA Avanzada</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Juega al ajedrez contra una inteligencia artificial de múltiples niveles,
            desde principiante hasta clase mundial, impulsada por Stockfish 17.1 WebAssembly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lobby"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Jugar Ahora
            </Link>
            <Link
              href="#features"
              className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold py-3 px-8 rounded-lg border border-gray-300 dark:border-slate-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Conocer Más
            </Link>
          </div>
        </div>

        {/* Características principales */}
        <div id="features" className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Características Destacadas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* IA Multi-Nivel */}
            <div className="card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">IA Multi-Nivel</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Desde nivel fácil (ELO 500) hasta clase mundial (ELO 3200) con estrategias adaptativas según la fase del juego.
              </p>
            </div>

            {/* Tecnología Avanzada */}
            <div className="card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Tecnología Avanzada</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Motor Stockfish 17.1 WebAssembly con configuración especializada por nivel ELO para decisiones óptimas.
              </p>
            </div>

            {/* Experiencia Completa */}
            <div className="card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Experiencia Completa</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tablero interactivo, historial de movimientos, temporizadores, análisis post-partida y mucho más.
              </p>
            </div>

            {/* Modos de Juego */}
            <div className="card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Múltiples Modos</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Juega contra la IA o contra otros jugadores, con controles de tiempo personalizables.
              </p>
            </div>

            {/* Análisis Inteligente */}
            <div className="card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Análisis Inteligente</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Explicaciones detalladas de movimientos, evaluación de posiciones y sugerencias estratégicas.
              </p>
            </div>

            {/* Código Abierto */}
            <div className="card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔓</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Código Abierto</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Construido con tecnologías modernas: Next.js, React, TypeScript, Tailwind CSS y más.
              </p>
            </div>
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Cómo Funciona la IA
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Análisis de Posición</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stockfish analiza la posición actual y determina la estrategia óptima según el nivel de dificultad.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Selección de Modelo</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ajusta automáticamente la temperatura y profundidad de análisis según el nivel ELO requerido.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Generación de Movimiento</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stockfish analiza la posición y genera el mejor movimiento aplicando la estrategia adecuada para cada nivel ELO.
              </p>
            </div>
          </div>
        </div>

        {/* Llamado a la acción */}
        <div className="text-center card rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Listo para jugar?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Elige tu nivel de dificultad y comienza una partida inolvidable contra nuestra IA avanzada.
          </p>
          <Link
            href="/lobby"
            className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Empezar a Jugar
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
