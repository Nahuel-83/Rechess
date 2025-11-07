// src/components/layout/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la aplicación */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">♟️</div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Ajedrez Online
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Plataforma avanzada de ajedrez con IA multi-nivel utilizando
              Stockfish 17.1 WebAssembly para una experiencia de juego excepcional.
            </p>
          </div>

          {/* Enlaces útiles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Recursos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tutorial" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
                  Tutorial
                </Link>
              </li>
              <li>
                <Link href="/estrategias" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
                  Estrategias
                </Link>
              </li>
              <li>
                <Link href="/analisis" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
                  Análisis de Partidas
                </Link>
              </li>
            </ul>
          </div>

          {/* Información técnica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Tecnología
            </h3>
            <div className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
              <div>• Next.js 15 + React 19</div>
              <div>• TypeScript + Tailwind CSS</div>
              <div>• Chess.js para lógica del juego</div>
              <div>• Stockfish 17.1 WebAssembly</div>
              <div>• Zustand para estado global</div>
            </div>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-600">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © 2025 Ajedrez Online. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
