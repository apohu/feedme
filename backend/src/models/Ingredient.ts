import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { Ingredient } from '../types';

export class IngredientModel {
  static async getAll(): Promise<Ingredient[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM ingredients ORDER BY name ASC'
    );
    return rows as Ingredient[];
  }

  static async getById(id: number): Promise<Ingredient | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM ingredients WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Ingredient) : null;
  }

  static async create(ingredient: Ingredient): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ingredients (name, description, nutriscore, calories_per_100g,
       proteins_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ingredient.name,
        ingredient.description,
        ingredient.nutriscore || 'C',
        ingredient.calories_per_100g || 0,
        ingredient.proteins_per_100g || 0,
        ingredient.carbs_per_100g || 0,
        ingredient.fats_per_100g || 0,
        ingredient.fiber_per_100g || 0
      ]
    );
    return result.insertId;
  }

  static async update(id: number, ingredient: Partial<Ingredient>): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE ingredients SET
       name = COALESCE(?, name),
       description = COALESCE(?, description),
       nutriscore = COALESCE(?, nutriscore),
       calories_per_100g = COALESCE(?, calories_per_100g),
       proteins_per_100g = COALESCE(?, proteins_per_100g),
       carbs_per_100g = COALESCE(?, carbs_per_100g),
       fats_per_100g = COALESCE(?, fats_per_100g),
       fiber_per_100g = COALESCE(?, fiber_per_100g)
       WHERE id = ?`,
      [
        ingredient.name,
        ingredient.description,
        ingredient.nutriscore,
        ingredient.calories_per_100g,
        ingredient.proteins_per_100g,
        ingredient.carbs_per_100g,
        ingredient.fats_per_100g,
        ingredient.fiber_per_100g,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM ingredients WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async search(name: string): Promise<Ingredient[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM ingredients WHERE name LIKE ? ORDER BY name ASC',
      [`%${name}%`]
    );
    return rows as Ingredient[];
  }
}
