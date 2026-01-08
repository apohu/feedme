import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { CalendarEntry, MealType, NutritionScore } from '../types';

export class CalendarEntryModel {
  static async getByDate(date: Date): Promise<CalendarEntry[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ce.*, r.name as recipe_name, r.nutriscore as recipe_nutriscore
       FROM calendar_entries ce
       LEFT JOIN recipes r ON ce.recipe_id = r.id
       WHERE ce.date = ?
       ORDER BY FIELD(ce.meal_type, 'breakfast', 'lunch', 'dinner', 'snack')`,
      [date]
    );
    return rows as CalendarEntry[];
  }

  static async getByDateRange(startDate: Date, endDate: Date): Promise<CalendarEntry[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ce.*, r.name as recipe_name, r.nutriscore as recipe_nutriscore
       FROM calendar_entries ce
       LEFT JOIN recipes r ON ce.recipe_id = r.id
       WHERE ce.date BETWEEN ? AND ?
       ORDER BY ce.date, FIELD(ce.meal_type, 'breakfast', 'lunch', 'dinner', 'snack')`,
      [startDate, endDate]
    );
    return rows as CalendarEntry[];
  }

  static async create(entry: CalendarEntry): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO calendar_entries (date, meal_type, recipe_id, servings, notes, nutriscore)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        entry.date,
        entry.meal_type,
        entry.recipe_id,
        entry.servings || 1,
        entry.notes,
        entry.nutriscore
      ]
    );
    return result.insertId;
  }

  static async update(id: number, entry: Partial<CalendarEntry>): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE calendar_entries SET
       recipe_id = COALESCE(?, recipe_id),
       servings = COALESCE(?, servings),
       notes = COALESCE(?, notes),
       nutriscore = COALESCE(?, nutriscore),
       daily_score = COALESCE(?, daily_score)
       WHERE id = ?`,
      [
        entry.recipe_id,
        entry.servings,
        entry.notes,
        entry.nutriscore,
        entry.daily_score,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM calendar_entries WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async calculateNutritionScore(startDate: Date, endDate: Date): Promise<NutritionScore> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        ce.nutriscore,
        COUNT(*) as count,
        AVG(i.calories_per_100g) as avg_calories,
        AVG(i.proteins_per_100g) as avg_proteins,
        AVG(i.carbs_per_100g) as avg_carbs,
        AVG(i.fats_per_100g) as avg_fats
       FROM calendar_entries ce
       LEFT JOIN recipes r ON ce.recipe_id = r.id
       LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
       LEFT JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ce.date BETWEEN ? AND ?
       GROUP BY ce.nutriscore`,
      [startDate, endDate]
    );

    const nutriscoreMap: any = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0
    };

    let totalMeals = 0;
    let weightedScore = 0;
    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    rows.forEach((row: any) => {
      const score = row.nutriscore;
      const count = parseInt(row.count);
      nutriscoreMap[score] = count;
      totalMeals += count;

      // Pondération du score : A=5, B=4, C=3, D=2, E=1
      const scoreValue = { A: 5, B: 4, C: 3, D: 2, E: 1 }[score as keyof typeof scoreValue] || 3;
      weightedScore += scoreValue * count;

      totalCalories += parseFloat(row.avg_calories || 0) * count;
      totalProteins += parseFloat(row.avg_proteins || 0) * count;
      totalCarbs += parseFloat(row.avg_carbs || 0) * count;
      totalFats += parseFloat(row.avg_fats || 0) * count;
    });

    const averageScore = totalMeals > 0 ? (weightedScore / totalMeals) : 3;
    const normalizedScore = (averageScore / 5) * 100; // Score sur 100

    return {
      daily_score: normalizedScore,
      weekly_score: normalizedScore,
      monthly_score: normalizedScore,
      period_score: normalizedScore,
      breakdown: {
        nutriscore_distribution: nutriscoreMap,
        average_calories: totalMeals > 0 ? totalCalories / totalMeals : 0,
        average_proteins: totalMeals > 0 ? totalProteins / totalMeals : 0,
        average_carbs: totalMeals > 0 ? totalCarbs / totalMeals : 0,
        average_fats: totalMeals > 0 ? totalFats / totalMeals : 0
      }
    };
  }
}
