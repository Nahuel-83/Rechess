// src/lib/chess/notation.ts
import { Move, Square } from '@/types';

export class NotationUtils {
  // Convertir coordenadas a notación algebraica
  static squareToAlgebraic(square: Square): string {
    return `${square.file}${square.rank}`;
  }

  // Convertir notación algebraica a coordenadas
  static algebraicToSquare(algebraic: string): Square {
    return {
      file: algebraic[0],
      rank: parseInt(algebraic[1])
    };
  }

  // Convertir movimiento a notación SAN (Standard Algebraic Notation)
  static moveToSAN(move: Move): string {
    return move.san;
  }

  // Convertir movimiento a notación LAN (Long Algebraic Notation)
  static moveToLAN(move: Move): string {
    return move.lan;
  }

  // Convertir movimiento a coordenadas simples (e2e4)
  static moveToCoordinateNotation(move: Move): string {
    return `${move.from.file}${move.from.rank}${move.to.file}${move.to.rank}`;
  }

  // Convertir coordenadas a movimiento
  static coordinateToMove(coordinate: string): { from: Square; to: Square } | null {
    if (coordinate.length !== 4) return null;

    return {
      from: {
        file: coordinate[0],
        rank: parseInt(coordinate[1])
      },
      to: {
        file: coordinate[2],
        rank: parseInt(coordinate[3])
      }
    };
  }

  // Obtener columna desde archivo
  static fileToColumn(file: string): number {
    return file.charCodeAt(0) - 'a'.charCodeAt(0);
  }

  // Obtener archivo desde columna
  static columnToFile(column: number): string {
    return String.fromCharCode('a'.charCodeAt(0) + column);
  }

  // Validar notación algebraica
  static isValidAlgebraicNotation(notation: string): boolean {
    return /^[a-h][1-8]$/.test(notation);
  }

  // Validar movimiento en notación de coordenadas
  static isValidCoordinateNotation(notation: string): boolean {
    return /^[a-h][1-8][a-h][1-8]$/.test(notation);
  }

  // Obtener distancia entre dos casillas
  static getDistance(from: Square, to: Square): number {
    const fileDiff = Math.abs(this.fileToColumn(from.file) - this.fileToColumn(to.file));
    const rankDiff = Math.abs(from.rank - to.rank);
    return Math.max(fileDiff, rankDiff);
  }

  // Verificar si dos casillas están en la misma fila
  static sameRank(from: Square, to: Square): boolean {
    return from.rank === to.rank;
  }

  // Verificar si dos casillas están en la misma columna
  static sameFile(from: Square, to: Square): boolean {
    return from.file === to.file;
  }

  // Verificar si dos casillas están en la misma diagonal
  static sameDiagonal(from: Square, to: Square): boolean {
    const fileDiff = Math.abs(this.fileToColumn(from.file) - this.fileToColumn(to.file));
    const rankDiff = Math.abs(from.rank - to.rank);
    return fileDiff === rankDiff;
  }
}
