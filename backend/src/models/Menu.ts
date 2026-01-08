import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { Menu, MenuRecipe } from '../types';

export class MenuModel {
  static async getAll(): Promise<Menu[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM menus ORDER BY start_date DESC'
    );
    return rows as Menu[];
  }

  static async getById(id: number): Promise<Menu | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM menus WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    const menu = rows[0] as Menu;
    menu.recipes = await this.getMenuRecipes(id);

    return menu;
  }

  static async getMenuRecipes(menuId: number): Promise<MenuRecipe[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mr.*, r.name as recipe_name, r.nutriscore
       FROM menu_recipes mr
       JOIN recipes r ON mr.recipe_id = r.id
       WHERE mr.menu_id = ?
       ORDER BY mr.day_of_cycle, FIELD(mr.meal_type, 'breakfast', 'lunch', 'dinner', 'snack')`,
      [menuId]
    );
    return rows as MenuRecipe[];
  }

  static async create(menu: Menu): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO menus (name, start_date, end_date, cycle_days, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        menu.name,
        menu.start_date,
        menu.end_date,
        menu.cycle_days || 7,
        menu.notes
      ]
    );
    return result.insertId;
  }

  static async update(id: number, menu: Partial<Menu>): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE menus SET
       name = COALESCE(?, name),
       start_date = COALESCE(?, start_date),
       end_date = COALESCE(?, end_date),
       cycle_days = COALESCE(?, cycle_days),
       notes = COALESCE(?, notes)
       WHERE id = ?`,
      [
        menu.name,
        menu.start_date,
        menu.end_date,
        menu.cycle_days,
        menu.notes,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM menus WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async addRecipe(menuRecipe: MenuRecipe): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO menu_recipes (menu_id, recipe_id, day_of_cycle, meal_type, servings, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        menuRecipe.menu_id,
        menuRecipe.recipe_id,
        menuRecipe.day_of_cycle,
        menuRecipe.meal_type,
        menuRecipe.servings || 1,
        menuRecipe.notes
      ]
    );
    return result.insertId;
  }

  static async removeRecipe(menuId: number, recipeId: number, dayOfCycle: number, mealType: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM menu_recipes WHERE menu_id = ? AND recipe_id = ? AND day_of_cycle = ? AND meal_type = ?',
      [menuId, recipeId, dayOfCycle, mealType]
    );
    return result.affectedRows > 0;
  }
}
