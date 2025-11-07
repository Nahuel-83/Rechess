'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center px-4">
        <div className="text-6xl mb-6">♟️</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          404 - Página no encontrada
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          La página que buscas no existe.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
